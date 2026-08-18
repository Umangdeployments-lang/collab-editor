import { Server } from '@hocuspocus/server';
import jwt from 'jsonwebtoken';
import RedisDocStore from './services/RedisDocStore';
import Redis from 'ioredis';
import * as Y from 'yjs';
import { getDocument, getDocumentByShareToken } from './services/DocumentService';
import * as dotenv from 'dotenv';

dotenv.config();

// Railway provides REDIS_URL as a full connection string.
// Fallback to individual vars for local dev (docker-compose).
const redisClient = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    });

const docStore = new RedisDocStore(redisClient);

const wsServer = Server.configure({
  port: parseInt(process.env.WS_PORT || '1234', 10),

  async onAuthenticate(data) {
    const { token, documentName, requestParameters } = data;
    
    // Allow public or shared via token
    if (requestParameters.has('shareToken')) {
      const shareToken = requestParameters.get('shareToken');
      const doc = await getDocumentByShareToken(shareToken as string);
      if (doc && doc.id === documentName) {
        return { user: { role: 'viewer' } }; // or editor based on logic, defaults viewer
      }
    }

    if (!token) {
      // Check if doc is public
      const doc = await getDocument(documentName);
      if (doc?.is_public) {
        return { user: { role: 'viewer' } };
      }
      throw new Error('Not authorized');
    }

    try {
      const secret = process.env.JWT_SECRET!;
      const decoded = jwt.verify(token, secret) as any;
      
      const doc = await getDocument(documentName, decoded.userId);
      if (!doc) {
        throw new Error('No access to document');
      }

      return { user: { id: decoded.userId } };
    } catch (error) {
      throw new Error('Not authorized');
    }
  },

  async onLoadDocument(data) {
    const { documentName } = data;
    const document = new Y.Doc();

    const state = await docStore.getMergedState(documentName);
    if (state) {
      Y.applyUpdate(document, state);
    }

    const updates = await docStore.getUpdates(documentName);
    if (updates.length > 0) {
      const mergedUpdates = Y.mergeUpdates(updates);
      Y.applyUpdate(document, mergedUpdates);
    }

    return document;
  },

  async onChange(data) {
    const { documentName, update, document } = data;
    
    await docStore.storeUpdate(documentName, update);

    const context = data.context as any;
    if (!context.changesCount) {
      context.changesCount = 0;
    }
    context.changesCount++;

    if (context.changesCount >= 100) {
      const state = Y.encodeStateAsUpdate(document);
      await docStore.storeMergedState(documentName, state);
      context.changesCount = 0;
    }
  },

  async onDisconnect(data) {
    console.log(`Client disconnected from doc ${data.documentName}`);
  }
});

export const startWsServer = async () => {
  await wsServer.listen();
  console.log(`WebSocket server listening on port ${process.env.WS_PORT || 1234}`);
};

export default wsServer;

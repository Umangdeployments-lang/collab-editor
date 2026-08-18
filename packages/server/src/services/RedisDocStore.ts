import { Redis } from 'ioredis';

export default class RedisDocStore {
  private redis: Redis;

  constructor(redisClient: Redis) {
    this.redis = redisClient;
  }

  async storeUpdate(docId: string, update: Uint8Array): Promise<void> {
    const buffer = Buffer.from(update);
    await this.redis.rpush(`ydoc:updates:${docId}`, buffer);
  }

  async getUpdates(docId: string): Promise<Uint8Array[]> {
    const updates = await this.redis.lrangeBuffer(`ydoc:updates:${docId}`, 0, -1);
    return updates.map(buf => new Uint8Array(buf));
  }

  async getMergedState(docId: string): Promise<Uint8Array | null> {
    const state = await this.redis.getBuffer(`ydoc:state:${docId}`);
    return state ? new Uint8Array(state) : null;
  }

  async storeMergedState(docId: string, state: Uint8Array): Promise<void> {
    const pipeline = this.redis.pipeline();
    const buffer = Buffer.from(state);
    pipeline.set(`ydoc:state:${docId}`, buffer);
    pipeline.del(`ydoc:updates:${docId}`);
    await pipeline.exec();
  }

  async deleteDoc(docId: string): Promise<void> {
    const pipeline = this.redis.pipeline();
    pipeline.del(`ydoc:state:${docId}`);
    pipeline.del(`ydoc:updates:${docId}`);
    await pipeline.exec();
  }
}

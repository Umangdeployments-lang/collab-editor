import { Router, Response } from 'express';
import { authenticate, optionalAuthenticate } from '../middleware/authenticate';
import { AuthenticatedRequest } from '../types';
import * as DocumentService from '../services/DocumentService';

const router = Router();

router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const docs = await DocumentService.getUserDocuments(req.user!.userId);
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get documents' });
  }
});

router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title } = req.body;
    const doc = await DocumentService.createDocument(req.user!.userId, title);
    res.status(201).json(doc);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create document' });
  }
});

router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const doc = await DocumentService.getDocument(req.params.id, req.user!.userId);
    if (!doc) {
      return res.status(404).json({ error: 'Not found or unauthorized' });
    }
    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get document' });
  }
});

router.patch('/:id/title', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const doc = await DocumentService.updateDocumentTitle(req.params.id, title, req.user!.userId);
    res.json(doc);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update' });
  }
});

router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await DocumentService.deleteDocument(req.params.id, req.user!.userId);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to delete' });
  }
});

router.get('/share/:token', optionalAuthenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const doc = await DocumentService.getDocumentByShareToken(req.params.token);
    if (!doc) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get shared document' });
  }
});

router.post('/:id/members', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, role } = req.body;
    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }
    await DocumentService.addMember(req.params.id, email, role, req.user!.userId);
    res.status(201).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to add member' });
  }
});

router.get('/:id/members', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const members = await DocumentService.getMembers(req.params.id);
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get members' });
  }
});

export default router;

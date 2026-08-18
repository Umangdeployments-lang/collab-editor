import { query } from '../db/postgres';
import { Document, User } from '../types';

export const createDocument = async (ownerId: string, title?: string): Promise<Document> => {
  const t = title || 'Untitled Document';
  const result = await query(
    `INSERT INTO documents (title, owner_id) VALUES ($1, $2) RETURNING *`,
    [t, ownerId]
  );
  return result.rows[0];
};

export const getUserDocuments = async (userId: string): Promise<Document[]> => {
  const result = await query(
    `
    SELECT DISTINCT d.* FROM documents d
    LEFT JOIN document_members dm ON d.id = dm.document_id
    WHERE d.owner_id = $1 OR dm.user_id = $1
    ORDER BY d.updated_at DESC
    `,
    [userId]
  );
  return result.rows;
};

export const getDocument = async (docId: string, userId?: string): Promise<Document | null> => {
  const result = await query(
    `
    SELECT d.* FROM documents d
    LEFT JOIN document_members dm ON d.id = dm.document_id AND dm.user_id = $2
    WHERE d.id = $1 AND (d.owner_id = $2 OR dm.user_id = $2 OR d.is_public = TRUE)
    `,
    [docId, userId]
  );
  return result.rows[0] || null;
};

export const updateDocumentTitle = async (docId: string, title: string, userId: string): Promise<Document> => {
  // Assuming only owner or editor can update title, let's keep it simple: only owner
  const result = await query(
    `UPDATE documents SET title = $1 WHERE id = $2 AND owner_id = $3 RETURNING *`,
    [title, docId, userId]
  );
  if (result.rowCount === 0) {
    throw new Error('Not found or unauthorized');
  }
  return result.rows[0];
};

export const deleteDocument = async (docId: string, userId: string): Promise<void> => {
  const result = await query(
    `DELETE FROM documents WHERE id = $1 AND owner_id = $2`,
    [docId, userId]
  );
  if (result.rowCount === 0) {
    throw new Error('Not found or unauthorized');
  }
};

export const getDocumentByShareToken = async (shareToken: string): Promise<Document | null> => {
  const result = await query(
    `SELECT * FROM documents WHERE share_token = $1`,
    [shareToken]
  );
  return result.rows[0] || null;
};

export const addMember = async (docId: string, email: string, role: 'editor' | 'viewer', ownerId: string): Promise<void> => {
  // Check ownership
  const docResult = await query(`SELECT * FROM documents WHERE id = $1 AND owner_id = $2`, [docId, ownerId]);
  if (docResult.rowCount === 0) {
    throw new Error('Document not found or you are not the owner');
  }

  // Find user by email
  const userResult = await query(`SELECT id FROM users WHERE email = $1`, [email]);
  if (userResult.rowCount === 0) {
    throw new Error('User not found');
  }

  const userId = userResult.rows[0].id;

  // Insert or update
  await query(
    `
    INSERT INTO document_members (document_id, user_id, role)
    VALUES ($1, $2, $3)
    ON CONFLICT (document_id, user_id) DO UPDATE SET role = EXCLUDED.role
    `,
    [docId, userId, role]
  );
};

export const getMembers = async (docId: string): Promise<Array<{user: User, role: string}>> => {
  const result = await query(
    `
    SELECT u.id, u.email, u.name, u.created_at, dm.role
    FROM document_members dm
    JOIN users u ON dm.user_id = u.id
    WHERE dm.document_id = $1
    `,
    [docId]
  );
  return result.rows.map(row => ({
    user: {
      id: row.id,
      email: row.email,
      name: row.name,
      created_at: row.created_at
    },
    role: row.role
  }));
};

import api from '@/api/axios';

export const fetchTemplates = (page = 0, size = 12) =>
  api.get('/routine/templates', { params: { page, size } });

export const createTemplate = (payload) =>
  api.post('/routine/templates', payload);

export const updateTemplate = (id, payload) =>
  api.put(`/routine/templates/${id}`, payload);

export const deleteTemplate = (id) =>
  api.delete(`/routine/templates/${id}`);

export const applyTemplateToRoutine = (id) =>
  api.post(`/routine/templates/${id}/toRoutine`);

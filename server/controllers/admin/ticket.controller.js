import { z } from 'zod';
import SupportTicket from '../../models/SupportTicket.js';
import * as supportTicketService from '../../services/supportTicket.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  const { status, priority, category, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;

  const skip = (Number(page) - 1) * Number(limit);
  const [tickets, total] = await Promise.all([
    SupportTicket.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('assignedTo', 'name email')
      .lean(),
    SupportTicket.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Tickets', {
    tickets,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
});

export const getOne = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id).populate('assignedTo', 'name email').lean();
  if (!ticket) throw new ApiError(404, 'NOT_FOUND', 'Ticket not found');
  sendSuccess(res, 200, 'Ticket', { ticket });
});

const updateSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assignedTo: z.string().min(1).optional(),
});

export const update = asyncHandler(async (req, res) => {
  const result = updateSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid ticket update data', result.error.flatten());
  }
  const { status, priority, assignedTo } = result.data;

  const data = {};
  if (status !== undefined) data.status = status;
  if (priority !== undefined) data.priority = priority;
  if (assignedTo !== undefined) data.assignedTo = assignedTo;
  if (status === 'resolved' || status === 'closed') data.resolvedAt = Date.now();

  const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, { $set: data }, { new: true });
  if (!ticket) throw new ApiError(404, 'NOT_FOUND', 'Ticket not found');
  sendSuccess(res, 200, 'Ticket updated', { ticket });
});

const messageSchema = z.object({ text: z.string().min(1) });

export const addMessage = asyncHandler(async (req, res) => {
  const result = messageSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid message data', result.error.flatten());
  }
  const { text } = result.data;

  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) throw new ApiError(404, 'NOT_FOUND', 'Ticket not found');

  await supportTicketService.addTicketMessage(ticket, { senderType: 'admin', sender: req.user._id, text });

  sendSuccess(res, 200, 'Message added', { ticket });
});

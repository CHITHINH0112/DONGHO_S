import {
  WatchService,
  RepairTicket,
  SerialNumber,
  User,
  Admin,
} from '../models/index.js';

export const getAllServices = async (options = {}) => {
  const where = {};
  if (options.all !== 'true' && options.all !== true && options.onlyActive !== false) {
    where.isActive = true;
  }
  return await WatchService.findAll({
    where,
    order: [['basePrice', 'ASC']],
  });
};

export const createService = async (data) => {
  return await WatchService.create(data);
};

export const updateService = async (id, data) => {
  const service = await WatchService.findByPk(id);
  if (!service) return null;
  await service.update(data);
  return service;
};

export const createRepairTicket = async (data) => {
  return await RepairTicket.create(data);
};

export const getRepairTickets = async (query = {}, reqUser = null) => {
  const where = {};
  if (query.status) {
    where.status = query.status;
  }
  if (query.serialNumberId) {
    where.serialNumberId = query.serialNumberId;
  }
  if (reqUser && reqUser.role === 'customer') {
    where.customerId = reqUser.id;
  }

  return await RepairTicket.findAll({
    where,
    order: [['id', 'DESC']],
    include: [
      {
        model: WatchService,
        as: 'service',
      },
      {
        model: SerialNumber,
        as: 'serialNumber',
      },
      {
        model: User,
        as: 'customer',
        attributes: ['id', 'name', 'phone'],
      },
      {
        model: Admin,
        as: 'staff',
        attributes: ['id', 'staffCode', 'name'],
      },
    ],
  });
};

export const updateRepairTicketStatus = async (id, { status, note, cost, paymentStatus, appointmentDate }) => {
  const ticket = await RepairTicket.findByPk(id);
  if (!ticket) return null;

  if (status) ticket.status = status;
  if (note !== undefined) ticket.note = note;
  if (cost !== undefined) ticket.cost = cost;
  if (paymentStatus !== undefined) ticket.paymentStatus = paymentStatus;
  if (appointmentDate !== undefined) ticket.appointmentDate = appointmentDate;
  await ticket.save();

  return ticket;
};

export default {
  getAllServices,
  createService,
  updateService,
  createRepairTicket,
  getRepairTickets,
  updateRepairTicketStatus,
};

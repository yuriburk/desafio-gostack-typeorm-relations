import { getRepository, Repository } from 'typeorm';

import IOrdersRepository from '@modules/orders/repositories/IOrdersRepository';
import ICreateOrderDTO from '@modules/orders/dtos/ICreateOrderDTO';
import Order from '../entities/Order';

class OrdersRepository implements IOrdersRepository {
  private ormRepository: Repository<Order>;

  constructor() {
    this.ormRepository = getRepository(Order);
  }

  public async create({ customer, products }: ICreateOrderDTO): Promise<Order> {
    const createdOrder = this.ormRepository.create({
      customer,
      order_products: products,
    });

    return this.ormRepository.save(createdOrder);
  }

  public async findById(id: string): Promise<Order | undefined> {
    return this.ormRepository.findOne({ where: { id } });
  }
}

export default OrdersRepository;

import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('This customer does not exists');
    }

    const productsFound = await this.productsRepository.findAllById(products);

    if (productsFound.length !== products.length) {
      throw new AppError('One or more products were not found');
    }

    const updateProducts: IProduct[] = [];
    productsFound.forEach(productFound => {
      const productBought = products.find(
        product => product.id === productFound.id,
      );

      if (!productBought) {
        throw new AppError('There was an error during the order verification');
      }

      if (productFound.quantity < productBought.quantity) {
        throw new AppError(
          `There is not enough quantity to be bought for the product ${productFound.name}`,
        );
      }

      updateProducts.push({
        id: productBought.id,
        quantity: productFound.quantity - productFound.quantity,
      });
    });

    await this.productsRepository.updateQuantity(updateProducts);

    const productsDTO = productsFound.map(product => ({
      product_id: product.id,
      quantity: product.quantity,
      price: product.price,
    }));

    const order = await this.ordersRepository.create({
      customer,
      products: productsDTO,
    });

    return order;
  }
}

export default CreateOrderService;

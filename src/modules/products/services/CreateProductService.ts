import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Product from '../infra/typeorm/entities/Product';
import IProductsRepository from '../repositories/IProductsRepository';

interface IRequest {
  name: string;
  price: number;
  quantity: number;
}

@injectable()
class CreateProductService {
  constructor(
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
  ) {}

  public async execute({ name, price, quantity }: IRequest): Promise<Product> {
    const alreadyExists =
      (await this.productsRepository.findByName(name)) !== undefined;

    if (alreadyExists) {
      throw new AppError('Name already in use', 400);
    }

    return this.productsRepository.create({ name, price, quantity });
  }
}

export default CreateProductService;

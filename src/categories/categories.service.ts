import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UniqueID } from 'nodejs-snowflake';

import { CategoryEntity } from './category.entity';
import { CategoryDTO } from './category.dto';

const uid = new UniqueID({ customEpoch: 1577836800, returnNumber: false });

@Injectable()
export class CategoriesService {

    constructor(@InjectRepository(CategoryEntity) private categoryRepository: Repository<CategoryEntity>) {}

    async getAllCategories() {
        return await this.categoryRepository.find();
    }

    async getCategory(id: string) {
        const category = await this.categoryRepository.findOne(id);
        if (!category) { throw new HttpException('Category not found', HttpStatus.NOT_FOUND); }
        return category;
    }

    async create(data: CategoryDTO) {

        const createData = {
            ...data,
            id: uid.getUniqueID() as string
        };

        const category = this.categoryRepository.create(createData);
        this.categoryRepository.save(category);
    }

    async delete(id: string) {
        const category = await this.categoryRepository.findOne({ where: { id }});
        if (!category) { throw new HttpException('Category not found', HttpStatus.NOT_FOUND); }
        await this.categoryRepository.delete(id);
        return category;
    }

    async update(id: string, data: Partial<CategoryDTO>) {
        let category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) { throw new HttpException('Category not found', HttpStatus.NOT_FOUND); }
        await this.categoryRepository.update(id, data);
        category = await this.categoryRepository.findOne({ where: { id } });
        return category;
    }

}

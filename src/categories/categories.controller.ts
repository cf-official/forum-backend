import {
    Controller,
    Get,
    Post,
    Delete,
    Put,
    Body,
    Param,
    UsePipes,
    UseGuards
} from '@nestjs/common';

import { CategoriesService } from './categories.service';
import { CategoryDTO } from './category.dto';
import { ValidationPipe } from './../shared/validation.pipe';
import { AuthGuard } from 'src/shared/auth.guard';
import { User } from 'src/users/user.decorator';

@Controller('categories')
export class CategoriesController {
    constructor(private categoriesService: CategoriesService) {}

    /**
     * Returns all forum categories in JSON format
     */
    @Get()
    public getAllCategories() {
        return this.categoriesService.getAllCategories();
    }

    /**
     * Creates new category and saves it to the database
     */
    @Post('new')
    @UseGuards(new AuthGuard())
    @UsePipes(new ValidationPipe())
    public createNewCategory(@User('id') userId, @Body() data: CategoryDTO) {
        return this.categoriesService.create(data, userId);
    }

    /**
     * Returns specified category
     *
     * @param id - id of the category
     */
    @Get(':id')
    public getCategory(@Param('id') id: string) {
        return this.categoriesService.getCategory(id);
    }

    /**
     * Deletes specified category
     *
     * @param id - id of the category
     */
    @Delete(':id')
    @UseGuards(new AuthGuard())
    public deleteCategory(@User('id') userId, @Param('id') id: string) {
        return this.categoriesService.delete(id, userId);
    }

    /**
     * Updates specified category
     *
     * @param id - id of the category
     */
    @Put(':id')
    @UseGuards(new AuthGuard())
    @UsePipes(new ValidationPipe())
    public updateCategory(
        @User('id') userId,
        @Param('id') id: string,
        @Body() data: Partial < CategoryDTO >
    ) {
        return this.categoriesService.update(id, data, userId);
    }
}

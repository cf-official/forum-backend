import {
    Controller,
    Get,
    Post,
    Delete,
    Put,
    Body,
    Param,
    UsePipes
} from '@nestjs/common';
import {
    CategoriesService
} from './categories.service';
import {
    CategoryDTO
} from './category.dto';
import {
    ValidationPipe
} from './../shared/validation.pipe';

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
    @UsePipes(new ValidationPipe())
    public createNewCategory(@Body() data: CategoryDTO) {
        return this.categoriesService.create(data);
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
    public deleteCategory(@Param('id') id: string) {
        return this.categoriesService.delete(id);
    }

    /**
     * Updates specified category
     *
     * @param id - id of the category
     */
    @Put(':id')
    @UsePipes(new ValidationPipe())
    public updateCategory(
        @Param('id') id: string,
        @Body() data: Partial<CategoryDTO>
    ) {
        return this.categoriesService.update(id, data);
    }
}

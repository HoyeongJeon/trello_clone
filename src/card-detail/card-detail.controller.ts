import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { CardDetailService } from './card-detail.service';
import { CardDetailReviewDto } from './dto/create-review.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Card 상세')
@UseGuards(AuthGuard('jwt'))
@Controller('cardDetail')
export class CardDetailController {
  constructor(private readonly cardDetailService: CardDetailService) {}

  @ApiBearerAuth()
  @Post(':cardId')
  @UseGuards(AuthGuard('jwt'))
  async createReview(
    @Request() req,
    @Param('cardId') cardId: number,
    @Body() cardDetailReviewDto: CardDetailReviewDto,
  ) {
    const userId = req.user.id;
    const data = await this.cardDetailService.create(
      userId,
      cardId,
      cardDetailReviewDto,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: '댓글이 생성되었습니다.',
      data,
    };
  }

  @ApiBearerAuth()
  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll() {
    return this.cardDetailService.findAll();
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateCardDetailDto: UpdateCardDetailDto,
  // ) {
  //   return this.cardDetailService.update(+id, updateCardDetailDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cardDetailService.remove(+id);
  }
}

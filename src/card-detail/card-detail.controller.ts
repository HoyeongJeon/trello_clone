import {
  Controller,
  Get,
  Post,
  Body,
  // Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { CardDetailService } from './card-detail.service';
import { CardDetailReviewDto } from './dto/create-review.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from 'src/user/decorators/user.decorator';

@ApiTags('Card 상세')
@UseGuards(AuthGuard('jwt'))
@Controller('cardDetail')
export class CardDetailController {
  constructor(private readonly cardDetailService: CardDetailService) {}

  @ApiBearerAuth()
  @Post(':cardId')
  @UseGuards(AuthGuard('jwt'))
  async createReview(
    @User() user,
    @Param('cardId') cardId: number,
    @Body() cardDetailReviewDto: CardDetailReviewDto,
  ) {
    const data = await this.cardDetailService.create(
      user.id,
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
  @Get(':cardId')
  @UseGuards(AuthGuard('jwt'))
  async findAll(@User() user, @Param('cardId') cardId: number) {
    const data = await this.cardDetailService.getReviewByCardDetail(cardId);

    return {
      statusCode: HttpStatus.OK,
      message: '카드 전체 조회를 성공했습니다.',
      data,
    };
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

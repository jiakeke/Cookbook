const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true }, // 菜谱名称（英文）——必填
    fi: { type: String }, // 菜谱名称（芬兰语）
    zh: { type: String }, // 菜谱名称（中文）
  },

  description: {
    en: { type: String }, // 一句话简介（英文）——菜品特色或口味说明
    fi: { type: String }, // 一句话简介（芬兰语）
    zh: { type: String }, // 一句话简介（中文）
  },

  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', // 关联用户表，如果是管理员也在 user 表里
    required: true,
  },

  isAdminCreated: { type: Boolean, default: false }, // 是否管理员创建

  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  likeCount: { type: Number, default: 0 },

  image: {
    type: String, // 菜谱主图（图片路径或URL）
  },

  country_or_region: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'countryOrRegion', // 关联国家或地区表（countryOrRegion 模型）
  },

  calorie: { type: Number }, // 热量（单位：kcal）
  protein: { type: Number }, // 蛋白质含量（单位：g）
  carbohydrate: { type: Number }, // 碳水化合物含量（单位：g）
  fat: { type: Number }, // 脂肪含量（单位：g）

  preparation: {
    en: { type: String }, // 烹饪步骤或准备方法（英文）
    fi: { type: String }, // 烹饪步骤或准备方法（芬兰语）
    zh: { type: String }, // 烹饪步骤或准备方法（中文）
    cookingTime: { type: Number }, // 烹饪时间（单位：分钟）
  },

  servings: { type: Number }, // 食用人数（例如 2 表示适合2人食用）

  ingredients: [
    {
      ingredient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ingredient', // 关联食材表（ingredient 模型）
      },
      quantity: { type: Number }, // 食材数量
      unit: { type: String }, // 单位（如 g、ml、pcs 等）
      optional: { type: Boolean, default: false }, // 是否为可选食材（默认 false）
      method: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'method', // 关联烹饪方法表（method 模型）
      },
    },
  ],

    remark: {
    en: { type: String }, // 备注/附加说明（英文）
    fi: { type: String }, // 备注/附加说明（芬兰语）
    zh: { type: String }, // 备注/附加说明（中文）
  },


}, { timestamps: true }); // 自动生成 createdAt 和 updatedAt

module.exports = mongoose.model('recipe', RecipeSchema);

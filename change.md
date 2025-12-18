删除账号一栏的书评、领券中心选项（与顶部导航重复）
删掉顶部导航栏的“我的优惠券”（与账号下拉重复，位置不合理）
优惠券中心：所有优惠券统一显示“兑换所需积分”，按钮统一为“兑换”，并根据后端返回的 code/msg 正确处理“积分不足”等错误提示
优惠券详情页：显示兑换所需积分；0 积分券也可显示并使用“兑换优惠券”按钮；兑换时同样根据返回 code/msg 判断是否兑换成功或积分不足
前后端字段对齐：删除前端旧字段 discount/expiryDate，统一使用 discountAmount/discountPercentage/validFrom/validTo 等新字段
区分类型：在前端新增 UserCoupon 类型，API 中用户持有优惠券相关接口（getUserCoupons/getUserOwnedCoupons/getUserCouponDetail）改用 UserCoupon，其余仍使用 Coupon
/* ==========================================================================
   GAMER ZONE — Home Page Script
   Displays featured products and hot deals on index.html.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  const allStoreProducts = window.GZ_PRODUCTS || [];

  // Show the first 4 products in the Featured section
  const featuredList = allStoreProducts.slice(0, 4);
  renderProducts('#featuredProducts', featuredList);

  // Filter products that have a promotional discount (old price > current price)
  const discountedList = allStoreProducts.filter(function (product) {
    return product.old > product.price;
  });

  const hotDealsList = discountedList.slice(0, 4);
  renderProducts('#dealProducts', hotDealsList);
});

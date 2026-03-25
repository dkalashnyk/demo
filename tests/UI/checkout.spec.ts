import { test } from '../../src/fixtures/test';
import allure from '../../src/utils/allure';
import { PRODUCTS } from '../../src/test-data/product';
import { CheckoutFactory } from '../../src/test-data/checkoutFactory';
import { ProductsPage } from '../../src/pages/ProductsPage';
import { CartPage } from '../../src/pages/CartPage';
import { CheckoutStepOnePage } from '../../src/pages/CheckoutStepOnePage';
import { CheckoutStepTwoPage } from '../../src/pages/CheckoutStepTwoPage';
import { CheckoutSummaryPage } from '../../src/pages/CheckoutSummaryPage';

const p = PRODUCTS.TC02;

test.describe('User purchases a product', () => {
  test('@ui TC02 User purchases one product', async ({ page }) => {
    await allure.epic('Web App');
    await allure.feature('Checkout');
    await allure.story('Purchase product');

    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    const checkoutStepOnePage = new CheckoutStepOnePage(page);
    const checkoutStepTwoPage = new CheckoutStepTwoPage(page);
    const checkoutSummaryPage = new CheckoutSummaryPage(page);

    const checkoutData = CheckoutFactory.create();

    await allure.step('Open Products page', async () => {
      await productsPage.open();
      await productsPage.assertOnProductsPage();
    });

    await allure.step('Add product to cart', async () => {
      await productsPage.expectProductVisible(p.name, {
        price: p.price,
        description: p.description,
        img: p.img,
      });
      await productsPage.addProductToCartByName(p.name);
      await productsPage.expectCartCount(1);
    });

    await allure.step('Verify cart contents', async () => {
      await cartPage.open();
      await cartPage.assertOnCartPage();
      await cartPage.expectNumberOfCartItems(1);
      await cartPage.expectCartItemVisible(p.name, {
        price: p.price,
        description: p.description,
        quantity: '1',
      });
    });

    await allure.step('Open Checkout page', async () => {
      await cartPage.proceedToCheckout();
      await checkoutStepOnePage.assertOnCheckoutPage();
    });

    await allure.step('Fill in Checkout information', async () => {
      const { firstName, lastName, zip } = checkoutData;
      await checkoutStepOnePage.fillCheckoutInformation(firstName, lastName, zip);
    });

    await allure.step('Open Checkout Step 2', async () => {
      await checkoutStepOnePage.clickContinue();
      await checkoutStepTwoPage.assertOnCheckoutPage();
    });

    await allure.step('Verify order details', async () => {
      await checkoutStepTwoPage.expectNumberOfCartItems(1);
      await checkoutStepTwoPage.expectItemInCart(p.name, {
        price: p.price,
        description: p.description,
        quantity: '1',
      });
      await checkoutStepTwoPage.expectItemTotal(p.price);
      await checkoutStepTwoPage.expectTaxTotal(p.tax);
      await checkoutStepTwoPage.expectTotal(p.total);
    });

    await allure.step('Finish purchase', async () => {
      await checkoutStepTwoPage.clickFinish();
      await checkoutSummaryPage.assertOnCheckoutPage();
      await checkoutSummaryPage.expectOrderCompleteMessage();
      await checkoutSummaryPage.clickBackHome();
      await productsPage.assertOnProductsPage();
    });
  });
});

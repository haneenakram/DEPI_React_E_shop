import handelRemoteRequest from "./shares/api.js";

//get elements id
const catgoriesContainer = $("#categories");
const loadingElement = $("#loading");
const errorElement = $("#error");
const loadingProducts = $("#loading-products");
const errorProducts = $("#error-products");
const mainElement = $("#main-content");
const itemsElement = $("#items");
const cartContainer = $(".cart-container");
var itemcount = $("#items-count");
var counter = 0;
var cart = [];
var endpoint = "products/categories/smartphones";
var handleSuccess = successCategories;

$(document).ready(function () {
  $(".close").on("click", function () {
    $(".cart-container").addClass("hide");
  });
});
$(document).ready(function () {
  $("#cart").on("click", function () {
    $(".cart-container").removeClass("hide");
  });
});

//endpoint, success, error, startLoading, stopLoading;
//just passing the parameter to implement the logic in api.js
handelRemoteRequest(
  "products/categories", //endpoint
  handleSuccess, //success
  function (err) {
    //error
    errorElement.removeClass("d-none");
    errorElement.addClass("d-flex");
    mainElement.removeClass("row");
    mainElement.addClass("d-none");
    errorElement.find(".alert").text(err.message);
  },
  function () {
    //loading
    loadingElement.removeClass("d-none");
    loadingElement.addClass("d-flex");
    // console.log("start loading categories");
  },
  function () {
    //stoploading
    loadingElement.removeClass("d-flex");
    loadingElement.addClass("d-none");
  }
);


function successCategories(data) {
  mainElement.removeClass("d-none");
  mainElement.addClass("row");
  catgoriesContainer.html(
    data
      .map(
        (item) =>
          `<li id="${item.slug}" class ="fs-6 py-2 px-1" >${item.name}</li>`
      )
      .join("")
  );
  data.forEach((item) => {
    $(`#${item.slug}`).on("click", function () {
      endpoint = `products/category/${item.slug}`;
      handelRemoteRequest(
        endpoint,
        successProducts,
        function (err) {
          //error
          errorProducts.removeClass("d-none");
          errorProducts.addClass("d-flex");
          itemsElement.removeClass("row");
          itemsElement.addClass("d-none");
          errorProducts.find(".alert").text(err.message);
        },
        function () {
          //loading
          loadingProducts.removeClass("d-none");
          loadingProducts.addClass("d-flex");
          // console.log("start loading products");
        },
        function () {
          //stoploading
          loadingProducts.removeClass("d-flex");
          loadingProducts.addClass("d-none");
        }
      );
    });
  });
}
function successProducts(data) {
  itemsElement.removeClass("d-none");
  itemsElement.addClass("row");
  // console.log("seccessproduct");
  // console.log(data.products);
  itemsElement.html(
    data.products
      .map((item) => {
        let pCart = {
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: 1,
          total: item.price,
          discountPercentage: item.discountPercentage,
          discountedTotal: item.discountPercentage,
          thumbnail: item.thumbnail,
        };

        return `<div class="col-4">
              <div class="border shadow rounded-2 px-3 py-2">
                <img
                  src="${item.thumbnail}"
                  class="w-100 mb-2"
                  style="height: 200px"
                />
                <div class="mb-3">
                  <h4 class="mb-1 text-center">${item.title}</h4>

                  <p> <b>Availability:</b> ${item.availabilityStatus}</p>
                  <p> <b>Return policy:</b> ${item.returnPolicy}</p>
                  <p> <b>Shipping:</b> ${item.shippingInformation}</p>
                  <div class="prod-desc">
                  <p><b>Description:</b> </p>
                  <p>${item.description}</p>
                  </div>
                </div>
                <div class="d-flex gap-2 mb-3 align-items-center">
                  <span class="text-warning">★</span>
                  <div class="px-2 bg-danger bg-opacity-75 rounded-2">${
                    item.rating
                  }</div>
                </div>
                <div class="d-flex gap-3 align-items-center">
                  <p class="fw-bold mb-0 fs-4">${item.price}</p>
                  <button class="btn btn-primary add" data-product='${JSON.stringify(
                    pCart
                  )}'>Add To Chart</button>
                </div>
              </div>
            </div>`;
      })
      .join("")
  );

  $(".add").on("click", function () {
    const product = JSON.parse($(this).attr("data-product"));
    addTocart(product);
    // showPopupNotification(product.title);
  });
}

function addTocart(product) {
  const productIndex = cart.findIndex((item) => item.id === product.id);
  if (productIndex !== -1) {
    cart[productIndex].quantity = Number(cart[productIndex].quantity) + 1;
    cart[productIndex].total =
      cart[productIndex].quantity * Number(cart[productIndex].price);
  } else {
    cart.push(product);
  }
  inCart();
}
function inCart() {
  // console.log(cart);
  if (cart.length > 0) {
    $("#items-count").removeClass("d-none");
    $("#items-count").html(`${cart.length}`);
    $(".no-items").addClass("d-none");
    $("#cart-body").removeClass("d-none");
    $("#cart-body").html(
      cart
        .map((item) => {
          console.log(item);
          return `
      <div
              class="d-flex border m-2 p-1 position-relative justify-content-around align-items-center">
              <div class="remove top-0 start-0 me-5 position-absolute fs-5 bg-danger text-light p-1" id = "${item.id}">
                <i class="fa-solid fa-xmark" aria-hidden="true" ></i>
              </div>
              <div class="image w-25 me-2">
                <img
                  class="h-100 w-100 object-fit-cover img-fluid"
                  src="${item.thumbnail}"
                  alt=""
                />
              </div>
              <div class="product-content d-flex flex-column gap-2 justify-content-center align-items-center flex-wrap">
                <h5>${item.title}</h5>
                <p>
                  Price: <span>${item.quantity}</span> x <span>${item.price}</span> : <span>${item.total}</span>
                </p>
              </div>
              <div class="arrows row gap-2 cursor-pointer">
                <i class="fa-solid fa-up-long" data-inc-id="${item.id}"></i>
                <i class="fa-solid fa-down-long" data-dec-id="${item.id}"></i>
              </div>
            </div>`;
        })
        .join("")
    );
    // Remove previous event listeners
    $("#cart-body").off("click", ".remove");
    $("#cart-body").off("click", "[data-inc-id]");
    $("#cart-body").off("click", "[data-dec-id]");

    $("#cart-body").on("click", ".remove", function () {
      const id = this.id.replace("remove-", "");
      removeFromCart(id);
    });
    $("#cart-body").on("click", "[data-inc-id]", function () {
      const id = $(this).data("inc-id");
      increase(id);
    });
    $("#cart-body").on("click", "[data-dec-id]", function () {
      const id = $(this).data("dec-id");
      decrease(id);
    });
  } else {
    $("#items-count").addClass("d-none");
    $("#cart-body").addClass("d-none");
    $(".no-items").removeClass("d-none");
  }
}
function increase(id) {
  
  const productIndex = cart.findIndex((item) => item.id === id);
  cart[productIndex].quantity = Number(cart[productIndex].quantity) + 1;
  cart[productIndex].total =
  cart[productIndex].quantity * Number(cart[productIndex].price);
  console.log(cart[productIndex].quantity);
  console.log(cart[productIndex].total);
  
  inCart();
}
function decrease(id) {
  // console.log("dec");
  const productIndex = cart.findIndex((item) => item.id === id);
  cart[productIndex].quantity = Number(cart[productIndex].quantity) - 1;
  cart[productIndex].total =
    cart[productIndex].quantity * Number(cart[productIndex].price);
  if (cart[productIndex].quantity <= 0) {
    cart.splice(productIndex, 1);
  }
  inCart();
}
  function removeFromCart(id) {
    cart = cart.filter((item) => item.id != id);
    console.log(cart);
    inCart();
  }

// $(".remove").on("click", function () {
//   const product = JSON.parse($(this).attr("data-product"));
//   var newcart = cart.filter((item) => item !== product);
//   cart = newcart;
// });
// cart.push(product);
// // console.log(product);

//get products done
//success done
//loading done
//error done

//the both endpoint is succefdull

//chart
//1- static design done
//2- UI Logic [toggle chart sidbar] done

//3- when user add proudct: push the whole object to the chart array
// show the length of array in span
// loop on the array in case it's not empty and show the proeuycts
// user can increas [check if number of items less than or equal stock property]
// user can decreas
// user can remove
//4- initial array products is empty => display some messge

// get proudcts by category

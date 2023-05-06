// Llaves de mi Stripe Api
import STRIPE_KEYS from "./stripe-keys.mjs";

//Variables y Constantes a utilizar
const d = document,
    $tacos = d.getElementById("tacos"),
    $template = d.getElementById("taco-template").content,
    $fragment = d.createDocumentFragment();

//Objeto de configuración a enviar por Fetch a la API de Stripe
const config = {
    headers: {
        Authorization: `Bearer ${STRIPE_KEYS.secret}`
    }
}

//Stripe Api
const URL_PRODUCTS = "https://api.stripe.com/v1/products";
const URL_PRICES = "https://api.stripe.com/v1/prices";
let products, prices;

const moneyFormat = num => `$${num.slice(0, -2)}.${num.slice(-2)}`;

//Ejecuto un Promise all para obtener el arreglo con mis productos y a su vez el arreglo con los precios
Promise.all([
    fetch(URL_PRODUCTS, config),
    fetch(URL_PRICES, config)
])
.then(responses => Promise.all(responses.map(res => res.json())))
.then(data => {

    //Asigno el resultado a mis dos arreglos
    products = Array.from(data[0].data);
    prices = Array.from(data[1].data);

        //Itero el arreglo de precios
        prices.forEach(el => {

        //Relaciono los precios con los productos
        let productData = products.filter(product => product.id === el.product);

        const { name, images, description } = productData[0];

        $template.querySelector(".taco__img img").setAttribute("src", images[0]);
        $template.querySelector(".taco__img img").setAttribute("alt", name);

        $template.querySelector(".taco__data h3").textContent = name;
        $template.querySelector(".taco__data p").textContent = description;

        $template.querySelector(".price").setAttribute("data-price", el.id);
        $template.querySelector(".price").textContent = `${moneyFormat(el.unit_amount_decimal)} ${(el.currency).toUpperCase()}`;

        let clone = d.importNode($template, true);
        $fragment.appendChild(clone);
    })

    $tacos.appendChild($fragment);
})
    .catch(error => console.error(error));

d.addEventListener("click", e => {

    if (e.target.matches(".price")) {
        let price = e.target.getAttribute("data-price");

        Stripe(STRIPE_KEYS.public)
        .redirectToCheckout( {
            lineItems: [{price, quantity: 1}],
            mode: "payment",
            successUrl: "http://127.0.0.1:5500/stripe-success.html",
            cancelUrl: "https://127.0.0.1:5500/stripe-cancel.html"
        })
        .then( res => {
            console.log(res);
        })
    }
})

const fecha = new Date();

d.getElementById("fecha-vigencia").textContent = `11/${ (fecha.getFullYear() + 1).toString().slice(-2) }`;
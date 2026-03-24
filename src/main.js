import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";
import { getImagesByQuery } from './js/pixabay-api.js'; 
import * as render from './js/render-functions.js';

const form = document.querySelector('.form'); 
const loadMoreBtn = document.querySelector('.load-more-btn');

let query = '';
let page = 1;
let totalHits = 0;

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    query = e.currentTarget.elements['search-text'].value.trim(); 

    if (!query) {
        iziToast.warning({ message: "Please enter a search query" });
        return;
    }

    page = 1;
    render.clearGallery();
    render.hideLoadMoreButton();
    render.showLoader();

    try {
        const data = await getImagesByQuery(query, page);
        totalHits = data.totalHits;

        if (data.hits.length === 0) {
            iziToast.error({ message: 'Sorry, no images found!' });
        } else {
            render.createGallery(data.hits);
           
            if (totalHits > 15) {
                render.showLoadMoreButton();
            } else { 
                iziToast.info({
                    message: "We're sorry, but you've reached the end of search results."
                });
            }
        }
        e.target.reset();
    } catch (error) {
        console.log(error);
        iziToast.error({ message: 'Something went wrong!' });
    } finally {
        render.hideLoader();
    }
});

loadMoreBtn.addEventListener('click', async () => {
    page += 1;
    render.hideLoadMoreButton();
    render.showLoader();

    try {
        const data = await getImagesByQuery(query, page);
        render.createGallery(data.hits);

        const card = document.querySelector('.gallery-item');
        if (card) {
            const cardHeight = card.getBoundingClientRect().height;
            window.scrollBy({ top: cardHeight * 2, behavior: 'smooth' });
        }

        if (page * 15 >= totalHits) {
            render.hideLoadMoreButton(); 
            iziToast.info({ message: "We're sorry, but you've reached the end of search results." });
        } else {
            render.showLoadMoreButton();
        }
    } catch (error) {
        iziToast.error({ message: 'Error loading more images!' });
    } finally {
        render.hideLoader();
    }
});

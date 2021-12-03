import Router from 'koa-router';

import { broadcast } from "../utils/webSocketServer.js";
import albumStore from './store.js';

export const router = new Router();

router.get('/', async (context) => {
    const userId = context.state.user._id;
    const response = context.response;
    response.body = await albumStore.find({ userId });
    response.status = 200; // ok
});

router.get('/:id', async (context) => {
   const userId = context.state.user._id;
   const album = await albumStore.findOne({ _id: context.params.id });
   const response = context.response;

    if(album) {
        if(album.userId === userId) {
            response.body = album;
            response.status = 200; // ok
        } else {
            response.status = 403; // forbidden
        }
    } else {
        response.status = 404; // not found
    }
});

router.get('/getAlbumsByAuthor/:author', async (context) => {
   const userId = context.state.user._id;
   const author = context.params.author;
   const response = context.response; 
   const albums = await albumStore.find({ userId });

   const returnedAlbums = [];
   albums.map(album => {
       if(album.author.includes(author)) {
           returnedAlbums.push(album);
       }
   });

   console.log(returnedAlbums);
   response.body = returnedAlbums;
   response.status = 200; // ok
});

const createAlbum = async (context, album, response) => {
    try {
        const userId = context.state.user._id;
        album.userId = userId;

        response.body = await albumStore.insert(album);
        response.status = 201; // created
        broadcast(userId, { type: 'created', payload: response.body });
    } catch(error) {
        console.log(error.message)
        response.body = { issue: [{ error: error.message }] };
        response.status = 400; // bad request
    }
}

router.post('/', async context => await createAlbum(context, context.request.body, context.response));

router.put('/:id', async (context) => {
   const album = context.request.body;
   const id = context.params.id;
   const response = context.response;

   const albumId = album._id;

   if(albumId && albumId !== id) {
       response.body = { issue: [{ error: 'Param id and body _id should be the same' }] };
       response.status = 400; // bad request
       return;
   }

   if(!albumId) {
       await createAlbum(context, album, response);
   } else {
       const userId = context.state.user._id;
       album.userId = userId;

       const updatedAlbum = await albumStore.update({ _id: id }, album);
       if(updatedAlbum === 1) {
           response.body = album;
           response.status = 200; // ok
           broadcast(userId, { type: 'updated', payload: album });
       } else {
           response.body = { issue: [{ error: 'Resource no longer exists' }] };
           response.status = 405; // method not allowed
       }
   }
});

import dataStore from 'nedb-promise';

export class AlbumStore {
    constructor({ filename, autoload }) {
        this.store = dataStore({filename, autoload});
    }

    async find(properties) {
        return this.store.find(properties);
    }

    async findOne(albumProperties) {
        return this.store.findOne(albumProperties);
    }

    async insert(album) {
        if(!album.title) {
            throw new Error('The title of the album is missing');
        }
        if(!album.author) {
            throw new Error('The author of the album is missing');
        }

        return this.store.insert(album);
    }

    async update(properties, album) {
        return this.store.update(properties, album);
    }
}

export default new AlbumStore({ filename: './database/albums.json',
                                               autoload: true });

import Validator from 'better-validator';
import PhotoModel from '../models/photo.mjs';
import AlbumModel from '../models/album.mjs';

const Photos = class Photos {
  constructor(app, connect) {
    this.app = app;
    this.PhotoModel = connect.model('Photo', PhotoModel);
    this.AlbumModel = connect.model('Album', AlbumModel);

    this.run();
  }

  deleteById() {
    // eslint-disable-next-line consistent-return
    this.app.delete('/album/:idalbum/photo/:idphoto', async (req, res) => {
      try {
        const { idalbum, idphoto } = req.params;

        // Vérifier que la photo existe et appartient à l'album
        const photo = await this.PhotoModel.findOne({ _id: idphoto, album: idalbum });
        if (!photo) {
          return res.status(404).json({ error: 'Photo not found in album' });
        }

        // Supprimer la photo
        await this.PhotoModel.findByIdAndDelete(idphoto);

        // Retirer l'ID de la photo du tableau `photos` de l'album
        await this.AlbumModel.findByIdAndUpdate(
          idalbum,
          { $pull: { photos: idphoto } },
          { new: true }
        );

        res.status(200).json({ message: 'Photo deleted successfully' });
      } catch (err) {
        console.error(`[ERROR] DELETE /album/${req.params.idalbum}/photo/${req.params.idphoto} -> ${err}`);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  }

  getAllPhotos() {
    this.app.get('/album/:idalbum/photos/', (req, res) => {
      try {
        this.PhotoModel.find({ album: req.params.idalbum }).then((photos) => {
          res.status(200).json(photos || {});
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] photo/:id -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  getPhotoByID() {
    // eslint-disable-next-line consistent-return
    this.app.get('/album/:idalbum/photo/:idphoto', async (req, res) => {
      try {
        const { idalbum, idphoto } = req.params;

        // Récupérer une seule photo qui appartient à cet album
        const photo = await this.PhotoModel.findOne({ _id: idphoto, album: idalbum }).populate('album');

        if (!photo) {
          return res.status(404).json({ error: 'Photo not found in album' });
        }

        res.status(200).json(photo);
      } catch (err) {
        console.error(`[ERROR] GET /album/${req.params.idalbum}/photo/${req.params.idphoto} -> ${err}`);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  }

  createPhoto() {
    // eslint-disable-next-line consistent-return
    this.app.post('/album/:idalbum/photo', async (req, res) => {
      try {
        const albumId = req.params.idalbum;

        // Vérifier que l'album existe
        const albumExists = await this.AlbumModel.findById(albumId);
        if (!albumExists) {
          return res.status(404).json({ error: 'Album not found' });
        }

        const validator = new Validator();
        validator(req.body.title).required().isString().lengthInRange(3, 100);
        validator(req.body.description).isString().lengthInRange(0, 500);
        validator(req.body.url).required().isString().lengthInRange(5, 300);
        const errors = validator.run();

        if (errors.length > 0) {
          return res.status(400).json({
            code: 400,
            message: 'Validation failed',
            errors: validator.errors
          });
        }

        // Créer la photo avec l'album lié
        const photoData = {
          ...req.body,
          album: albumId
        };

        const photoModel = new this.PhotoModel(photoData);
        const savedPhoto = await photoModel.save();

        // Ajouter la photo à l'album
        await this.AlbumModel.findByIdAndUpdate(
          albumId,
          { $push: { photos: savedPhoto._id } },
          { new: true }
        );

        res.status(201).json(savedPhoto);
      } catch (err) {
        console.error(`[ERROR] POST /album/:idalbum/photo -> ${err}`);
        res.status(500).json({ error: 'Internal Server error' });
      }
    });
  }

  updatePhoto() {
    // eslint-disable-next-line consistent-return
    this.app.put('/album/:idalbum/photo/:idphoto', async (req, res) => {
      try {
        const { idalbum, idphoto } = req.params;

        // Vérifie que l'album existe
        const album = await this.AlbumModel.findById(idalbum);
        if (!album) {
          return res.status(404).json({ error: 'Album not found' });
        }

        // Vérifie que la photo appartient bien à l'album
        const photo = await this.PhotoModel.findOne({ _id: idphoto, album: idalbum });
        if (!photo) {
          return res.status(404).json({ error: 'Photo not found in album' });
        }

        const validator = new Validator();
        validator(req.body.title).isString().lengthInRange(3, 100);
        validator(req.body.description).isString().lengthInRange(0, 500);
        validator(req.body.url).isString().lengthInRange(5, 300);
        const errors = validator.run();

        if (errors.length > 0) {
          return res.status(400).json({
            code: 400,
            message: 'Validation failed',
            errors: validator.errors
          });
        }

        // Met à jour la photo
        const updatedPhoto = await this.PhotoModel.findByIdAndUpdate(
          idphoto,
          req.body,
          { new: true, runValidators: true }
        );

        res.status(200).json(updatedPhoto);
      } catch (err) {
        console.error(`[ERROR] PUT /album/${req.params.idalbum}/photo/${req.params.idphoto} -> ${err}`);
        res.status(500).json({ error: 'Internal Server error' });
      }
    });
  }

  run() {
    this.createPhoto();
    this.getAllPhotos();
    this.getPhotoByID();
    this.deleteById();
    this.updatePhoto();
  }
};

export default Photos;

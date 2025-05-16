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
    this.app.delete('/photo/:id', (req, res) => {
      try {
        this.PhotoModel.findByIdAndDelete(req.params.id).then((photo) => {
          res.status(200).json(photo || {});
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
    this.app.get('/album/:idalbum/photo/:idphoto', (req, res) => {
      try {
        this.PhotoModel.find({ album: req.params.idalbum, _id: req.params.idphoto }).populate('album')
          .then((photos) => {
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

  create() {
    this.app.post('/album/:idalbum/photo', (req, res) => {
      try {
        const photoModel = new this.PhotoModel(req.body);
        photoModel.save().then((photo) => {
          this.AlbumModel
            .findByIdAndUpdate(req.params.idalbum, { $push: { photos: photo._id } }, { new: true })
            .then(
              (updatedPhoto) => {
                res.status(200).json(updatedPhoto || {});
              }
            );
        }).catch(() => {
          res.status(200).json({});
        });
      } catch (err) {
        console.error(`[ERROR] photo/create -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  run() {
    this.create();
    this.getAllPhotos();
    this.getPhotoByID();
    this.deleteById();
  }
};

export default Photos;

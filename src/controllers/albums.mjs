import validator from 'better-validator';
import AlbumModel from '../models/album.mjs';

const Albums = class Albums {
  constructor(app, connect, authToken) {
    this.app = app;
    this.AlbumModel = connect.model('Album', AlbumModel);

    this.app.use('/album', authToken);
    this.app.use('/albums', authToken);

    this.run();
  }

  deleteById() {
    this.app.delete('/album/:id', (req, res) => {
      try {
        this.AlbumModel.findByIdAndDelete(req.params.id).then((album) => {
          res.status(200).json(album || {});
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] album/:id -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  showById() {
    this.app.get('/album/:id', (req, res) => {
      try {
        this.AlbumModel.findById(req.params.id).populate('photos').then((album) => {
          res.status(200).json(album || {});
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] album/:id -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  getAllAlbums() {
    this.app.get('/albums/', (req, res) => {
      try {
        const { title } = req.query;
        if (!title) {
          res.status(400).json({ error: 'Title is required' });
        } else {
          this.AlbumModel.find({ title: { $regex: title } }).populate('photos').then((album) => {
            if (album.length === 0) {
              res.status(404).json({ error: 'No items found matching the title' });
            } else {
              res.status(200).json(album || {});
            }
          }).catch(() => {
            res.status(500).json({
              code: 500,
              message: 'Internal Server error'
            });
          });
        }
      } catch (err) {
        console.error(`[ERROR] album/:id -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  create() {
    // eslint-disable-next-line consistent-return
    this.app.post('/album/', (req, res) => {
      try {
        const v = validator(req.body);
        v.property('title').required().string().minLength(3)
          .maxLength(100);
        v.property('description').optional().string().maxLength(500);
        v.property('photos').optional().array(); // tu peux aussi valider chaque ObjectId si besoin

        if (!v.run()) {
          return res.status(400).json({
            code: 400,
            message: 'Validation failed',
            errors: v.errors
          });
        }
        const albumModel = new this.AlbumModel(req.body);

        albumModel.save().then((album) => {
          res.status(201).json(album || {});
        }).catch(() => {
          res.status(201).json({});
        });
      } catch (err) {
        console.error(`[ERROR] album/create -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  updateById() {
    // eslint-disable-next-line consistent-return
    this.app.put('/album/:id', (req, res) => {
      try {
        const v = validator(req.body);
        v.property('title').optional().string().minLength(3)
          .maxLength(100);
        v.property('description').optional().string().maxLength(500);

        if (!v.run()) {
          return res.status(400).json({
            code: 400,
            message: 'Validation failed',
            errors: v.errors
          });
        }
        this.AlbumModel.findByIdAndUpdate(
          req.params.id,
          req.body,
          { new: true, runValidators: true }
        ).then((updatedAlbum) => {
          if (!updatedAlbum) {
            res.status(404).json({ error: 'Album not found' });
          } else {
            res.status(200).json(updatedAlbum);
          }
        }).catch((err) => {
          console.error(`[ERROR] album/:id [update] -> ${err}`);
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] album/:id [update] -> ${err}`);
        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  run() {
    this.create();
    this.showById();
    this.deleteById();
    this.getAllAlbums();
    this.updateById();
  }
};

export default Albums;

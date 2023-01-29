import m from 'mithril';

export default class ImageUpload {
  constructor(vnode) {
    this.status = vnode.attrs.status;

    this.uid = vnode.attrs.uid;

    this.upload = {
      uploaded: false,
      curr: 0,
      total: 0,
    }
  }

  uploadToServer(image) {
    const formdata = new FormData();
    formdata.append('imgfile', image);
    formdata.append('uid', this.uid);

    console.log(formdata);  

    return new Promise((res, rej) => {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "http://localhost:2003/uploadImageToProject", true);
      xhr.onload = function() {
        if (this.status === 200) res();
        else rej();
      };
      xhr.send(formdata);
    });
  }

  async uploadImages(files) {
    this.upload.curr = 0;
    this.upload.total = files.length;

    let fileCopy = [...files];
    
    const batch_size = 5;

    while (fileCopy.length > 0) {
      let batch = fileCopy.splice(0, batch_size);
      
      await this.uploadToServer(batch);

      this.upload.curr += batch.length;

      m.redraw();
    }

    this.status('success');
  }

  view(vnode) {
    return [
      m('div.upload-container', {
        style: {
          display: vnode.attrs.active ? 'flex' : 'none',
        },
        ondragover: e => {
          e.preventDefault();
        },
        ondragleave: e => {
          e.preventDefault();
        },
        ondrop: e => {
          this.uploadImages([...e.dataTransfer.files]);
        },
        onclick: e => {
          document.querySelector('#imageIn').click();
        }
      }, [
        m('div.upload-header', 'Drag / Click to Upload Files'),
        m('div.upload-svg-container', 
          m('svg', {
            viewBox:"0 0 24 24",
          }, m('path', {
            d: "M11 20H6.5Q4.22 20 2.61 18.43 1 16.85 1 14.58 1 12.63 2.17 11.1 3.35 9.57 5.25 9.15 5.88 6.85 7.75 5.43 9.63 4 12 4 14.93 4 16.96 6.04 19 8.07 19 11 20.73 11.2 21.86 12.5 23 13.78 23 15.5 23 17.38 21.69 18.69 20.38 20 18.5 20H13V12.85L14.6 14.4L16 13L12 9L8 13L9.4 14.4L11 12.85Z",
          }))
        )
      ]),

      m("input", {
        type: "file",
        accept: 'image/png, image/jpeg',
        id: "imageIn", 
        name: "imgFile",
        multiple: true, 
        hidden:"hidden", 
        onchange: async e => {
          await this.uploadImages([...e.target.files]);
        }
      })
    ];
  }
}
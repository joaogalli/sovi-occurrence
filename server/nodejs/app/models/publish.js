var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 
// set up a mongoose model
var PublishSchema = new Schema({
    message: {
        type: String,
        required: true
    },
    creation: {
        type: Date
    },
    lojista: {
        type: Schema.ObjectId,
        ref: 'Lojista',
        required: true
    }
});

// PublishSchema.pre('save', function (next) {
//     var bean = this;
//     if ((bean.isModified('cnpj') || bean.isNew()) && !validarCNPJ(bean.cnpj)) {
//         return next('validation.lojista.cnpj.invalid');
//     } else if (!bean.name || bean.name.length === 0) {
//         return next('validation.lojista.nome.empty');
//     } else {
//         return next();
//     }
// });

module.exports = mongoose.model('Publish', PublishSchema);
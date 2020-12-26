const Koa = require('koa');
const logger = require('koa-logger');
const bodyparser = require('koa-bodyparser');
const cors = require('koa2-cors');
const Router = require('koa-router');

const ApiHandler = require('./ApiHandler');
const OnekvWrapper = require('./onekvWrapper');
const keys = require('./config/keys');

const API = {
  ValidCandidates: '/valid',
  Nominators: '/nominators',
  Statistic: '/statistic/:stash',
  FalseNominations: '/falseNominations',
  Validators: '/validators',
  onekv: '/onekv',
  Certbot: '/.well-known/acme-challenge/NyFCixcgJXG-gyG0iclY9YPSt94rTXhnGsvlxDyy1Xc'
}

const app = new Koa();
app.use(logger());
app.use(cors());
app.use(bodyparser());

(async() => {
  try {
    
    const handler = await ApiHandler.create(keys.KUSAMA_WSS);
    const onekvWrapper = new OnekvWrapper(handler);
    const router = new Router();
    
    router.get('/', async (ctx) => {
      ctx.body = 'Welcome validators.';
    });

    router.get(API.ValidCandidates, async (ctx) => {
      const valid = await onekvWrapper.valid();
      ctx.body = valid;
    });

    router.get(API.Nominators, async (ctx) => {
      const nominators = await onekvWrapper.nominators();
      ctx.body = nominators;
    });

    router.get(API.Statistic, async (ctx) => {
      const { stash } = ctx.params;
      console.log(stash);
      const statistic = await onekvWrapper.statistic('kusama', stash);
      ctx.body = statistic;
    });

    router.get(API.FalseNominations, async (ctx) => {
      const falseNominator = await onekvWrapper.falseNominator();
      ctx.body = falseNominator;
    });

    router.get(API.Validators, async (ctx) => {
      const validators = await onekvWrapper.getValidators();
      ctx.body = validators;
    });

    router.get(API.onekv, async (ctx) => {
      const validators = await onekvWrapper.getValidators();
      let list = [];
      validators.valid.forEach((validator) => {
        list.push({
          stash: validator.stash,
          name: validator.name,
          rank: validator.rank,
          electedRate: validator.electedRate,
          eras: `from ${validator.stakerPoints[0].era} to ${validator.stakerPoints[validator.stakerPoints.length - 1].era}`,
        })
      })
      ctx.body = list;
    })

    router.get(API.Certbot, async (ctx) => {
      ctx.body = 'NyFCixcgJXG-gyG0iclY9YPSt94rTXhnGsvlxDyy1Xc';
    })

    app.use(router.routes());

    app.listen(keys.PORT);


  } catch (e) {
    console.log(e);
  }
  return;
})();


 
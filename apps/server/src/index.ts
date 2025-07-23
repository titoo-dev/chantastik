import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Bindings } from './types';
import project from './routes/project';
import youtube from './routes/youtube';
import audio from './routes/audio';

const app = new Hono<{
	Bindings: Bindings;
}>();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.route('/project', project);
app.route('/youtube', youtube);
app.route('/audio', audio);


export default app;

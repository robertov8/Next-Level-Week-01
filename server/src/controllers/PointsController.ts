import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController {
  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query;

    const parsedItems = String(items)
      .split(',')
      .map((item) => Number(item.trim()));

    const points = await knex('points')
      .distinct()
      .select('points.*')
      .join('points_items', 'points.id', '=', 'points_items.points_id')
      .whereIn('points_items.items_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf));

    return response.json(points);
  }

  async show(request: Request, response: Response) {
    const { id } = request.params;

    const point = await knex('points').where('id', id).first();

    if (!point) {
      return response.status(400).json({ message: 'Point not found' });
    }

    const items = await knex('items')
      .select('items.id', 'items.title')
      .join('points_items', 'items.id', '=', 'points_items.items_id')
      .where('points_items.points_id', id);

    return response.json({
      point,
      items,
    });
  }

  async create(request: Request, response: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = request.body;

    const point = {
      image: 'https://images.unsplash.com/photo-1556767576-5ec41e3239ea?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    };

    const trx = await knex.transaction();

    const [points_id] = await trx('points').insert(point);

    const pointItems = items.map((items_id: Number) => ({
      items_id,
      points_id,
    }));

    await trx('points_items').insert(pointItems);

    await trx.commit();

    return response.json({
      id: points_id,
      ...point,
    });
  }
}

export default new PointsController();

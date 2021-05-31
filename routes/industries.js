const express = require('express');
const router = new express.Router();
const db = require('../db');
const slugify = require('slugify');

router.get('/', async (req, res, next) => {
	try {
		const results = await db.query(`
            SELECT code, industry FROM industries 
        `);
		return res.json(results.row[0]);
	} catch {
		return next(err);
	}
});

router.post('/', async (req, res, next) => {
	try {
		const { industry } = req.body;
		const code = slugify(industry, { lower: true, replacement: '_' });

		const results = await db.query(
			`INSERT INTO industries (code, industry) 
        VALUES ($1, $2) RETURNING id, code, industry`,
			[code, industry]
		);
		return res.json(results.rows[0]);
	} catch {
		return next(err);
	}
});

router.delete('/:id', async (req, res, next) => {
	try {
		const id = req.params.id;
		await db.query(`DELETE FROM industries WHERE id = $1`, [id]);
		return res.json({ message: 'deleted' });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;

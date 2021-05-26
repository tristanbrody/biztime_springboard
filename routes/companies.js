const express = require('express');
const router = new express.Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
	const results = await db.query(`SELECT * FROM companies`);

	return res.json({ companies: results.rows });
});

router.get('/:code', async (req, res, next) => {
	try {
		const code = req.params.code;

		const result = await db.query(
			`SELECT name, code, description FROM companies WHERE code = $1 RETURNING name, code, description`,
			[code]
		);

		return res.json({ company: result.rows[0] });
	} catch (err) {
		return next(err);
	}
});

router.post('/', async (req, res, next) => {
	try {
		const { code, name, description } = req.body;

		const result = await db.query(
			`
            INSERT INTO companies (name, code, description) 
            VALUES ($1, $2, $3)
            RETURNING name, code, description
        `,
			[name, code, description]
		);
		return res.json({ company: result.rows[0] });
	} catch (err) {
		return next(err);
	}
});

router.put('/:code', async (req, res, next) => {
	try {
		const code = req.params.code;
		const { name, description } = req.body;
		const result = await db.query(
			`
            UPDATE companies SET name=$1, code, description = $2 FROM companies WHERE code = $3 RETURNING name, code, description
        `,
			[name, description, code]
		);
		return res.json({ company: result.rows[0] });
	} catch (err) {
		return next(err);
	}
});

router.delete('/:code', async (req, res, next) => {
	try {
		const code = req.params.code;
		const result = await db.query(`DELETE FROM companies WHERE code = $1`, [code]);

		return res.json({ message: 'deleted' });
	} catch (err) {
		return next(err);
	}
});

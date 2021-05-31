const express = require('express');
const router = new express.Router();
const db = require('../db');
const slugify = require('slugify');

router.get('/', async (req, res, next) => {
	const results = await db.query(
		`SELECT c.code AS company_code, c.name AS company_name, i.code AS industry_code FROM companies AS c LEFT JOIN company_industry AS ci ON ci.company = c.code LEFT JOIN industries AS i ON ci.industry = i.id`
	);

	return res.json({ companies: results.rows });
});

router.get('/:code', async (req, res, next) => {
	try {
		const code = req.params.code;

		const results = await db.query(`SELECT name, code, description FROM companies WHERE code = $1`, [code]);

		return res.json({ company: results.rows[0] });
	} catch (err) {
		return next(err);
	}
});

router.post('/', async (req, res, next) => {
	try {
		const { name, description } = req.body;

		const code = slugify(name, { lower: true, replacement: '_' });
		const results = await db.query(
			`
            INSERT INTO companies (name, code, description) 
            VALUES ($1, $2, $3)
            RETURNING name, code, description
        `,
			[name, code, description]
		);
		return res.json({ company: results.rows[0] });
	} catch (err) {
		return next(err);
	}
});

router.put('/:code', async (req, res, next) => {
	try {
		const code = req.params.code;
		const { name, description } = req.body;
		const results = await db.query(
			`
            UPDATE companies SET name=$1, description = $2 WHERE code = $3 RETURNING name, code, description
        `,
			[name, description, code]
		);
		return res.json({ company: results.rows[0] });
	} catch (err) {
		return next(err);
	}
});

router.delete('/:code', async (req, res, next) => {
	try {
		const code = req.params.code;
		const result = await db.query(`DELETE FROM companies WHERE code = $1 RETURNING code`, [code]);
		if (result.rows.length == 0) {
			return res.sendStatus(404);
		} else {
			return res.json({ status: 'deleted' });
		}
	} catch (err) {
		return next(err);
	}
});

module.exports = router;

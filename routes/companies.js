const express = require('express');
const router = new express.Router();
const db = require('../db');
const slugify = require('slugify');
require('dotenv').config();

router.get('/', async (req, res, next) => {
	const resultss = await db.query(
		`SELECT c.code AS company_code, c.name AS company_name, i.code AS industry_code FROM companies AS c LEFT JOIN company_industry AS ci ON ci.company = c.code LEFT JOIN industries AS i ON ci.industry = i.code`
	);

	return res.json({ companies: resultss.rows });
});

router.get('/:code', async (req, res, next) => {
	try {
		const code = req.params.code;

		const results = await db.query(
			`SELECT name, code, description FROM companies WHERE code = $1 RETURNING name, code, description`,
			[code]
		);

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
            UPDATE companies SET name=$1, code, description = $2 FROM companies WHERE code = $3 RETURNING name, code, description
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
		await db.query(`DELETE FROM companies WHERE code = $1`, [code]);
		return res.json({ message: 'deleted' });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;

const express = require('express');
const router = new express.Router();
const db = require('../db');
require('dotenv').config();

router.get('/', async (req, res, next) => {
	try {
		const result = await db.query(`SELECT * FROM invoices`);
		return res.json({ invoice: result.rows });
	} catch (err) {
		return next(err);
	}
});

router.get('/:id', async (req, res, next) => {
	try {
		let invoiceId = req.params.id;
		const invoice = await db.query(
			`
            SELECT id, comp_code, amt, paid, add_date, paid_date FROM invoices WHERE id = $1
        `,
			[invoiceId]
		);
		let company = await db.query(`SELECT code, name, description FROM companies WHERE code = $1`, [
			invoice.rows[0].comp_code
		]);
		const { id, amt, paid, add_date, paid_date, comp_code } = invoice.rows[0];
		company = company.rows[0];
		return res.json({ invoice: { id, amt, paid, add_date, comp_code, paid_date, company: { company } } });
	} catch (err) {
		return next(err);
	}
});

router.post('/', async (req, res, next) => {
	try {
		const { comp_code, amt } = req.body;
		const result = await db.query(
			`
            INSERT (comp_code, amt) INTO invoices VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date
        `,
			[comp_code, amt]
		);
		return res.json({ invoice: result.rows[0] });
	} catch (err) {
		return next(err);
	}
});

router.put('/:id', async (req, res, next) => {
	try {
		const { amt, paid } = req.body;
		const invoice_id = req.params.id;
		let paid_date;

		const invoice = await db.query(`GET paid, paid_date FROM invoices WHERE id = $2`, [invoice_id]);
		if (!invoice.paid && paid) {
			paid_date = new Date();
		} else if (invoice.paid) {
			paid_date = invoice.paid_date;
		} else {
			paid_date = null;
		}
		const result = await db.query(
			`
            UPDATE invoices SET amt = $1 paid_date = $2 FROM invoices WHERE id = $3
            RETURNING id, comp_code, amt, paid, add_date, paid_date
            `,
			[amt, paid_date, invoice_id]
		);
		const response = result.rows[0];
		return res.json({ invoice: { response } });
	} catch (err) {
		return next(err);
	}
});

router.delete('/:id', async (req, res, next) => {
	try {
		const invoice_id = req.params.id;
		const result = await db.query(
			`
            DELETE FROM invoices WHERE id = $1
            `,
			[invoice_id]
		);
		return res.json({ message: 'deleted' });
	} catch (err) {}
});

module.exports = router;

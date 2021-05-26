const express = require('express');
const router = new express.Router();
const db = require('../db');

router.get('/', (req, res, next) => {
	try {
		const result = db.query(`SELECT * FROM invoices`);
		return res.json({ invoice: result.rows[0] });
	} catch (err) {
		return next(err);
	}
});

router.get('/:id', (req, res, next) => {
	try {
		let invoiceId = req.params.id;
		const invoice = db.query(
			`
            SELECT id, comp_code, amt, paid, add_date, paid_date FROM invoices WHERE id = $1
        `,
			[invoiceId]
		);
		const company = db.query(`SELECT code, name, description FROM companies WHERE code = $1`, [invoice.comp_code]);
		const { id, amt, paid, add_date, paid_date } = invoice;
		return res.json({ invoice: { id, amt, paid, add_date, paid_date, company: { company } } });
	} catch (err) {
		return next(err);
	}
});

router.post('/', (req, res, next) => {
	try {
		const { comp_code, amt } = req.body;
		const result = db.query(
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

router.put('/:id', (req, res, next) => {
	try {
		const { amt } = req.body;
		const invoice_id = req.params.id;
		const result = db.query(
			`
            UPDATE invoices SET amt = $1 FROM invoices WHERE id = $2
            `,
			[amt, invoice_id]
		);
	} catch (err) {
		return next(err);
	}
});

router.delete('/:id', (req, res, next) => {
	try {
		const invoice_id = req.params.id;
		const result = db.query(
			`
            DELETE FROM invoices WHERE id = $1
            `,
			[invoice_id]
		);
		return res.json({ message: 'deleted' });
	} catch (err) {}
});

process.env.NODE_ENV = test;
const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompanies;

const postData = {
	name: 'asus',
	description: 'they make cheap computers'
};

const putData = {
	name: 'apple',
	description: 'they make expensive computers'
};

beforeEach(async function () {
	await db.query('DELETE FROM invoices');
	await db.query('DELETE FROM companies');
	const result = await db.query(`
        INSERT INTO companies
        VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
        ('ibm', 'IBM', 'Big blue.')
        RETURNING name, code, description;
    `);
	testCompanies = result.rows;
});

afterAll(async () => {
	await db.end();
});

describe('get routes', function () {
	test('it should return all companies in db', async function () {
		const getRequest = await request(app).get('/companies');
		expect(getRequest.body).toEqual({
			companies: [
				{
					company_code: 'apple',
					company_name: 'Apple Computer',
					industry_code: null
				},
				{
					company_code: 'ibm',
					company_name: 'IBM',
					industry_code: null
				}
			]
		});
	}, 5000);

	test('it should return info for a specific company in db', async function () {
		const getRequest = await request(app).get('/companies/apple');
		expect(getRequest.body).toEqual({
			company: {
				code: 'apple',
				description: 'Maker of OSX.',
				name: 'Apple Computer'
			}
		});
	});
});

describe('post routes', function () {
	test('it should create a company in db', async function () {
		const postRequest = await request(app).post('/companies').send(postData);
		expect(postRequest.body).toEqual({
			company: {
				name: 'asus',
				code: 'asus',
				description: 'they make cheap computers'
			}
		});
	});
});

describe('put routes', function () {
	test('it should update a company in db', async function () {
		const putRequest = await request(app).put('/companies/apple').send(putData);
		expect(putRequest.body).toEqual({
			company: {
				name: 'apple',
				code: 'apple',
				description: 'they make expensive computers'
			}
		});
	});
});

describe('delete routes', function () {
	test('it should delete a company in db', async function () {
		const deleteRequest = await request(app).delete('/companies/apple');
		expect(deleteRequest.body).toEqual({
			status: 'deleted'
		});
	});
});

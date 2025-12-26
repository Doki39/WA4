import express from 'express';
import fs from 'fs/promises';
import { type } from 'os';

const app = express();
app.use(express.json());

app.listen(3000, () => {
console.log('Poslužitelj je pokrenut na portu 3000');
});

app.get('/zaposlenici', async (req, res) => {
    try{
        const data = await fs.readFile('data/zaposlenici.json', 'utf8');
        let zaposlenici = JSON.parse(data);
        if(req.query.age_sort){
            zaposlenici.sort(function(a, b){
                return a.godine_staza - b.godine_staza;
            })
        }
        if(req.query.pozicija){
            zaposlenici = zaposlenici.filter(f => f.pozicija.toLowerCase() === req.query.pozicija.toLowerCase());
        }; 
        if(req.query.godine_staza_max){
            const max = parseInt(req.query.godine_staza_max);
            zaposlenici = zaposlenici.filter(f => f.godine_staza <= max);
        }
        if(req.query.godine_staza_min){
            const min = parseInt(req.query.godine_staza_min);
            zaposlenici = zaposlenici.filter(f => f.godine_staza >= min);
        }
        res.status(200).send(zaposlenici);
    } catch (error){
        console.error('Greska prilikom citanje datoteke', error);
         res.status(500).send('Greska prilikom citanja datoteke');
    }
});

app.get('/zaposlenici/:id', async (req,res) => {
    try{
        const data = await fs.readFile('data/zaposlenici.json', 'utf-8');
        const zaposlenici = JSON.parse(data);

        const id = Number(req.params.id);
        const zaposlenik = zaposlenici.find(f => f.id === id)

        if(!zaposlenik){
           return res.status(404).send('Zaposlenik nije pronaden');
        }
        return res.status(200).send(zaposlenik);

    } catch (error){
        console.error('greska prilikom citanja datoteke', error);
        return res.status(500).send('Greska prilikom citanja datoteke')
    }
});

app.post('/zaposlenici', async (req,res) => {
    const { ime, prezime, godine_staza, pozicija } = req.body;

    if (req.body.id){
        return res.status(400).send('ID se ne smije slat')
    }
    if ( 
        ime === undefined ||
        prezime === undefined ||
        godine_staza === undefined ||
        pozicija === undefined
    ) {
        return res.status(400).send('Sva polja su obavezna: id, ime, prezime, godine_staza, pozicija');
    }
    if ( 
        !Number.isInteger(godine_staza) ||
        typeof ime !== 'string' ||
        typeof prezime !== 'string' ||
        typeof pozicija !== 'string'
    )
        {
        return res.status(400).send('Neodgovarajuca vrsta podataka')
    }

    try{
        const data = await fs.readFile('data/zaposlenici.json', 'utf-8');
        const zaposlenici = JSON.parse(data);
        const maxId = zaposlenici.length > 0 ? Math.max(...zaposlenici.map(z => z.id)): 0;

        const id = maxId + 1;
        const zaposlenik = {
            id,
            ime,
            prezime,
            godine_staza,
            pozicija
        };

        zaposlenici.push(zaposlenik);
        
        await fs.writeFile('data/zaposlenici.json', JSON.stringify(zaposlenici,null,2));

        res.status(201).send('zaposlenik dodan');
    } catch (error){
        console.error(error);
        res.status(500).send('Greska pri citanju datoteke');
    }
})
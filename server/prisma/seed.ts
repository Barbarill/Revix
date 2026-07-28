import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding auto...')

  const cars = [
    // ── FIAT ──────────────────────────────────────────────────────────
    { brand: 'Fiat', model: 'Panda',        year_from: 2003, year_to: 2012, fuel: 'Benzina', horsepower: 60 },
    { brand: 'Fiat', model: 'Panda',        year_from: 2012, year_to: null, fuel: 'Benzina', horsepower: 69 },
    { brand: 'Fiat', model: 'Punto',        year_from: 1999, year_to: 2018, fuel: 'Benzina', horsepower: 65 },
    { brand: 'Fiat', model: '500',          year_from: 2007, year_to: null, fuel: 'Benzina', horsepower: 69 },
    { brand: 'Fiat', model: 'Tipo',         year_from: 2015, year_to: null, fuel: 'Benzina', horsepower: 95 },
    { brand: 'Fiat', model: 'Bravo',        year_from: 2007, year_to: 2014, fuel: 'Diesel',  horsepower: 120 },
    { brand: 'Fiat', model: 'Doblo',        year_from: 2010, year_to: 2022, fuel: 'Diesel',  horsepower: 90 },

    // ── VOLKSWAGEN ────────────────────────────────────────────────────
    { brand: 'Volkswagen', model: 'Golf',   year_from: 2012, year_to: 2019, fuel: 'Diesel',  horsepower: 110 },
    { brand: 'Volkswagen', model: 'Golf',   year_from: 2019, year_to: null, fuel: 'Benzina', horsepower: 130 },
    { brand: 'Volkswagen', model: 'Polo',   year_from: 2009, year_to: 2017, fuel: 'Benzina', horsepower: 75 },
    { brand: 'Volkswagen', model: 'Polo',   year_from: 2017, year_to: null, fuel: 'Benzina', horsepower: 95 },
    { brand: 'Volkswagen', model: 'Passat', year_from: 2010, year_to: 2019, fuel: 'Diesel',  horsepower: 150 },
    { brand: 'Volkswagen', model: 'Tiguan', year_from: 2016, year_to: null, fuel: 'Diesel',  horsepower: 150 },
    { brand: 'Volkswagen', model: 'T-Roc',  year_from: 2017, year_to: null, fuel: 'Benzina', horsepower: 115 },

    // ── FORD ──────────────────────────────────────────────────────────
    { brand: 'Ford', model: 'Focus',        year_from: 2011, year_to: 2018, fuel: 'Diesel',  horsepower: 105 },
    { brand: 'Ford', model: 'Focus',        year_from: 2018, year_to: null, fuel: 'Benzina', horsepower: 125 },
    { brand: 'Ford', model: 'Fiesta',       year_from: 2008, year_to: 2017, fuel: 'Benzina', horsepower: 80 },
    { brand: 'Ford', model: 'Fiesta',       year_from: 2017, year_to: 2023, fuel: 'Benzina', horsepower: 95 },
    { brand: 'Ford', model: 'Kuga',         year_from: 2012, year_to: 2019, fuel: 'Diesel',  horsepower: 150 },
    { brand: 'Ford', model: 'Puma',         year_from: 2019, year_to: null, fuel: 'Ibrido',  horsepower: 125 },

    // ── TOYOTA ────────────────────────────────────────────────────────
    { brand: 'Toyota', model: 'Yaris',      year_from: 2011, year_to: 2020, fuel: 'Ibrido',  horsepower: 100 },
    { brand: 'Toyota', model: 'Yaris',      year_from: 2020, year_to: null, fuel: 'Ibrido',  horsepower: 116 },
    { brand: 'Toyota', model: 'Corolla',    year_from: 2018, year_to: null, fuel: 'Ibrido',  horsepower: 122 },
    { brand: 'Toyota', model: 'RAV4',       year_from: 2018, year_to: null, fuel: 'Ibrido',  horsepower: 218 },
    { brand: 'Toyota', model: 'Aygo',       year_from: 2014, year_to: 2022, fuel: 'Benzina', horsepower: 72 },

    // ── RENAULT ───────────────────────────────────────────────────────
    { brand: 'Renault', model: 'Clio',      year_from: 2012, year_to: 2019, fuel: 'Benzina', horsepower: 90 },
    { brand: 'Renault', model: 'Clio',      year_from: 2019, year_to: null, fuel: 'Ibrido',  horsepower: 140 },
    { brand: 'Renault', model: 'Megane',    year_from: 2015, year_to: 2022, fuel: 'Diesel',  horsepower: 110 },
    { brand: 'Renault', model: 'Captur',    year_from: 2013, year_to: 2019, fuel: 'Benzina', horsepower: 90 },
    { brand: 'Renault', model: 'Captur',    year_from: 2019, year_to: null, fuel: 'Ibrido',  horsepower: 140 },
    { brand: 'Renault', model: 'Kadjar',    year_from: 2015, year_to: 2022, fuel: 'Diesel',  horsepower: 130 },

    // ── PEUGEOT ───────────────────────────────────────────────────────
    { brand: 'Peugeot', model: '208',       year_from: 2012, year_to: 2019, fuel: 'Benzina', horsepower: 82 },
    { brand: 'Peugeot', model: '208',       year_from: 2019, year_to: null, fuel: 'Benzina', horsepower: 100 },
    { brand: 'Peugeot', model: '308',       year_from: 2013, year_to: 2021, fuel: 'Diesel',  horsepower: 120 },
    { brand: 'Peugeot', model: '2008',      year_from: 2019, year_to: null, fuel: 'Benzina', horsepower: 130 },
    { brand: 'Peugeot', model: '3008',      year_from: 2016, year_to: null, fuel: 'Diesel',  horsepower: 130 },

    // ── ALFA ROMEO ────────────────────────────────────────────────────
    { brand: 'Alfa Romeo', model: 'Giulietta', year_from: 2010, year_to: 2021, fuel: 'Diesel',  horsepower: 150 },
    { brand: 'Alfa Romeo', model: 'Giulia',    year_from: 2016, year_to: null, fuel: 'Benzina', horsepower: 200 },
    { brand: 'Alfa Romeo', model: 'Stelvio',   year_from: 2017, year_to: null, fuel: 'Diesel',  horsepower: 210 },
    { brand: 'Alfa Romeo', model: 'MiTo',      year_from: 2008, year_to: 2018, fuel: 'Benzina', horsepower: 78 },

    // ── LANCIA ────────────────────────────────────────────────────────
    { brand: 'Lancia', model: 'Ypsilon',    year_from: 2011, year_to: null, fuel: 'Benzina', horsepower: 69 },
    { brand: 'Lancia', model: 'Delta',      year_from: 2008, year_to: 2014, fuel: 'Diesel',  horsepower: 130 },

    // ── BMW ───────────────────────────────────────────────────────────
    { brand: 'BMW', model: 'Serie 1',       year_from: 2011, year_to: 2019, fuel: 'Diesel',  horsepower: 116 },
    { brand: 'BMW', model: 'Serie 1',       year_from: 2019, year_to: null, fuel: 'Benzina', horsepower: 136 },
    { brand: 'BMW', model: 'Serie 3',       year_from: 2018, year_to: null, fuel: 'Diesel',  horsepower: 190 },
    { brand: 'BMW', model: 'X1',            year_from: 2015, year_to: 2022, fuel: 'Diesel',  horsepower: 150 },
    { brand: 'BMW', model: 'X3',            year_from: 2017, year_to: null, fuel: 'Diesel',  horsepower: 190 },

    // ── MERCEDES ──────────────────────────────────────────────────────
    { brand: 'Mercedes', model: 'Classe A', year_from: 2012, year_to: 2018, fuel: 'Diesel',  horsepower: 109 },
    { brand: 'Mercedes', model: 'Classe A', year_from: 2018, year_to: null, fuel: 'Benzina', horsepower: 163 },
    { brand: 'Mercedes', model: 'Classe C', year_from: 2014, year_to: 2021, fuel: 'Diesel',  horsepower: 170 },
    { brand: 'Mercedes', model: 'GLA',      year_from: 2013, year_to: 2020, fuel: 'Diesel',  horsepower: 136 },
    { brand: 'Mercedes', model: 'GLC',      year_from: 2015, year_to: null, fuel: 'Diesel',  horsepower: 194 },

    // ── AUDI ──────────────────────────────────────────────────────────
    { brand: 'Audi', model: 'A3',           year_from: 2012, year_to: 2020, fuel: 'Diesel',  horsepower: 116 },
    { brand: 'Audi', model: 'A3',           year_from: 2020, year_to: null, fuel: 'Benzina', horsepower: 150 },
    { brand: 'Audi', model: 'A4',           year_from: 2015, year_to: null, fuel: 'Diesel',  horsepower: 150 },
    { brand: 'Audi', model: 'Q3',           year_from: 2018, year_to: null, fuel: 'Benzina', horsepower: 150 },
    { brand: 'Audi', model: 'Q5',           year_from: 2017, year_to: null, fuel: 'Diesel',  horsepower: 190 },

    // ── OPEL ──────────────────────────────────────────────────────────
    { brand: 'Opel', model: 'Corsa',        year_from: 2014, year_to: 2019, fuel: 'Benzina', horsepower: 75 },
    { brand: 'Opel', model: 'Corsa',        year_from: 2019, year_to: null, fuel: 'Benzina', horsepower: 100 },
    { brand: 'Opel', model: 'Astra',        year_from: 2015, year_to: 2021, fuel: 'Diesel',  horsepower: 110 },
    { brand: 'Opel', model: 'Mokka',        year_from: 2020, year_to: null, fuel: 'Benzina', horsepower: 130 },

    // ── HYUNDAI / KIA ─────────────────────────────────────────────────
    { brand: 'Hyundai', model: 'i20',       year_from: 2014, year_to: 2020, fuel: 'Benzina', horsepower: 75 },
    { brand: 'Hyundai', model: 'Tucson',    year_from: 2015, year_to: 2020, fuel: 'Diesel',  horsepower: 136 },
    { brand: 'Hyundai', model: 'Tucson',    year_from: 2020, year_to: null, fuel: 'Ibrido',  horsepower: 230 },
    { brand: 'Kia', model: 'Sportage',      year_from: 2016, year_to: 2021, fuel: 'Diesel',  horsepower: 136 },
    { brand: 'Kia', model: 'Sportage',      year_from: 2021, year_to: null, fuel: 'Ibrido',  horsepower: 230 },
    { brand: 'Kia', model: 'Stonic',        year_from: 2017, year_to: null, fuel: 'Benzina', horsepower: 100 },

    // ── NISSAN / DACIA ────────────────────────────────────────────────
    { brand: 'Nissan', model: 'Qashqai',    year_from: 2013, year_to: 2021, fuel: 'Diesel',  horsepower: 110 },
    { brand: 'Nissan', model: 'Qashqai',    year_from: 2021, year_to: null, fuel: 'Ibrido',  horsepower: 158 },
    { brand: 'Nissan', model: 'Micra',      year_from: 2016, year_to: null, fuel: 'Benzina', horsepower: 90 },
    { brand: 'Dacia', model: 'Sandero',     year_from: 2012, year_to: 2020, fuel: 'Benzina', horsepower: 75 },
    { brand: 'Dacia', model: 'Sandero',     year_from: 2020, year_to: null, fuel: 'Benzina', horsepower: 90 },
    { brand: 'Dacia', model: 'Duster',      year_from: 2017, year_to: null, fuel: 'Diesel',  horsepower: 115 },

    // ── JEEP / SEAT / SKODA ───────────────────────────────────────────
    { brand: 'Jeep', model: 'Renegade',     year_from: 2014, year_to: null, fuel: 'Diesel',  horsepower: 120 },
    { brand: 'Jeep', model: 'Compass',      year_from: 2017, year_to: null, fuel: 'Diesel',  horsepower: 140 },
    { brand: 'Seat', model: 'Ibiza',        year_from: 2017, year_to: null, fuel: 'Benzina', horsepower: 95 },
    { brand: 'Seat', model: 'Leon',         year_from: 2012, year_to: 2020, fuel: 'Diesel',  horsepower: 110 },
    { brand: 'Seat', model: 'Ateca',        year_from: 2016, year_to: null, fuel: 'Diesel',  horsepower: 150 },
    { brand: 'Skoda', model: 'Octavia',     year_from: 2012, year_to: 2020, fuel: 'Diesel',  horsepower: 110 },
    { brand: 'Skoda', model: 'Fabia',       year_from: 2014, year_to: 2021, fuel: 'Benzina', horsepower: 75 },
    { brand: 'Skoda', model: 'Karoq',       year_from: 2017, year_to: null, fuel: 'Diesel',  horsepower: 150 },
  ]

  let inserted = 0
  let skipped = 0

  for (const car of cars) {
    const existing = await prisma.car.findFirst({
      where: {
        brand: car.brand,
        model: car.model,
        year_from: car.year_from,
      },
    })

    if (existing) {
      skipped++
    } else {
      await prisma.car.create({ data: car })
      inserted++
    }
  }

  console.log(`✅ Inserite ${inserted} auto, ${skipped} già presenti`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
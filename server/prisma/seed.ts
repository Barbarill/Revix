import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding auto...')

  const cars = [
    { brand: 'Fiat', model: 'Panda', year_from: 2003, year_to: 2012, fuel: 'Benzina', horsepower: 60 },
    { brand: 'Fiat', model: 'Panda', year_from: 2012, year_to: null, fuel: 'Benzina', horsepower: 69 },
    { brand: 'Fiat', model: 'Punto', year_from: 1999, year_to: 2018, fuel: 'Benzina', horsepower: 65 },
    { brand: 'Fiat', model: '500', year_from: 2007, year_to: null, fuel: 'Benzina', horsepower: 69 },
    { brand: 'Volkswagen', model: 'Golf', year_from: 2012, year_to: 2019, fuel: 'Diesel', horsepower: 110 },
    { brand: 'Volkswagen', model: 'Polo', year_from: 2009, year_to: 2017, fuel: 'Benzina', horsepower: 75 },
    { brand: 'Ford', model: 'Focus', year_from: 2011, year_to: 2018, fuel: 'Diesel', horsepower: 105 },
    { brand: 'Lancia', model: 'Ypsilon', year_from: 2011, year_to: null, fuel: 'Benzina', horsepower: 69 },
    { brand: 'Alfa Romeo', model: 'Giulietta', year_from: 2010, year_to: 2021, fuel: 'Diesel', horsepower: 150 },
    { brand: 'Toyota', model: 'Yaris', year_from: 2011, year_to: 2020, fuel: 'Ibrido', horsepower: 100 },
  ]

  for (const car of cars) {
    await prisma.car.create({ data: car })
  }

  console.log(`✅ Inserite ${cars.length} auto`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
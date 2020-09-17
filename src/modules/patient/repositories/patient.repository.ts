import { Repository, EntityRepository } from 'typeorm';
import { Patient } from '../models/patient.model';


@EntityRepository(Patient)
export class PatientRepository extends Repository<Patient> { }

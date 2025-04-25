import { RampDTO } from '@/dto/ramp.dto';
import axios from 'axios';

export const createRamp = async (rampDto: RampDTO): Promise<RampDTO> => {
  try {
    const res = await axios.post<RampDTO, RampDTO>('/api/ramp', rampDto);

    return res;
  } catch (error) {
    throw error;
  }
};

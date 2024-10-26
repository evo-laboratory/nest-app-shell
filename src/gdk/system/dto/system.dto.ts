import { IClient, IHttpEndpoint, IRole, ISystem } from '@gdk-system/types';
import { ApiProperty } from '@nestjs/swagger';
import { RoleDto } from './role.dto';
import { ClientDto } from './client.dto';
import { HttpEndpointDto } from './http-endpoint.dto';

export class SystemDto implements ISystem {
  @ApiProperty({ type: [RoleDto] })
  roles: IRole[];
  rolesUpdatedAt: Date;
  @ApiProperty({ type: [HttpEndpointDto] })
  endpoints: IHttpEndpoint[];
  endpointUpdatedAt: Date;
  @ApiProperty({ type: [ClientDto] })
  clients: IClient[];
  newSignUpDefaultUserRole: string;
  clientUpdatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

import { gql } from 'apollo-server-express';

export const addressTypes = gql`
  # type MapCoordinates {
  #   latitude: Float
  #   longitude: Float
  # }

  # type Address {
  #   addressId: ID!
  #   addressLine: String!
  #   city: String!
  #   region: String!
  #   postalCode: String!
  #   country: String!
  #   map: MapCoordinates
  #   isPrimary: Boolean!
  #   type: AddressType!
  #   createdAt: String!
  #   updatedAt: String!
  # }

  # input MapCoordinatesInput {
  #   latitude: Float
  #   longitude: Float
  # }

  # input AddressInput {
  #   addressLine: String!
  #   city: String!
  #   region: String!
  #   postalCode: String!
  #   country: String!
  #   map: MapCoordinatesInput
  #   isPrimary: Boolean
  #   type: AddressType
  # }

  type AddressResult {
    success: Boolean!
    message: String!
    address: Address
  }

  type DeleteAddressResult {
    success: Boolean!
    message: String!
  }

  extend type Query {
    getAddressById(addressId: String!): AddressResult!
  }

  extend type Mutation {
    createAddress(input: AddressInput!): AddressResult!
    updateAddress(addressId: String!, input: AddressInput!): AddressResult!
    deleteAddress(addressId: String!): AddressResult!
  }
`;

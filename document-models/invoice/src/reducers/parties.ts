/**
 * This is a scaffold file meant for customization:
 * - modify it by implementing the reducer functions
 * - delete the file and run the code generator again to have it reset
 */

import { LegalEntityId, Maybe } from "document-models/invoice/gen";
import { InvoicePartiesOperations } from "../../gen/parties/operations";

function getStateValue<T>(
  input: T | undefined,
  currentValue: T | null,
): T | null {
  return input === undefined ? currentValue : input;
}

export const reducer: InvoicePartiesOperations = {
  editIssuerOperation(state, action, dispatch) {
    try {
      state.issuer = {
        ...state.issuer,
        address: {
          city: getStateValue(
            action.input.city,
            state.issuer.address?.city ?? null,
          ),
          country: getStateValue(
            action.input.country,
            state.issuer.address?.country ?? null,
          ),
          extendedAddress: getStateValue(
            action.input.extendedAddress,
            state.issuer.address?.extendedAddress ?? null,
          ),
          postalCode: getStateValue(
            action.input.postalCode,
            state.issuer.address?.postalCode ?? null,
          ),
          stateProvince: getStateValue(
            action.input.stateProvince,
            state.issuer.address?.stateProvince ?? null,
          ),
          streetAddress: getStateValue(
            action.input.streetAddress,
            state.issuer.address?.streetAddress ?? null,
          ),
        },
        contactInfo: {
          tel: getStateValue(
            action.input.tel,
            state.issuer.contactInfo?.tel ?? null,
          ),
          email: getStateValue(
            action.input.email,
            state.issuer.contactInfo?.email ?? null,
          ),
        },
        country: action.input.country ?? state.issuer.country,
        id: action.input.id ? { taxId: action.input.id } : state.issuer.id,
        name: getStateValue(action.input.name, state.issuer.name ?? null),
      };
    } catch (e) {
      console.error(e);
    }
  },
  editIssuerBankOperation(state, action, dispatch) {
    try {
      if (!state.issuer.paymentRouting) {
        state.issuer.paymentRouting = {
          bank: null,
          wallet: null,
        };
      }

      state.issuer.paymentRouting.bank = {
        ABA: getStateValue(
          action.input.ABA,
          state.issuer.paymentRouting.bank?.ABA ?? null,
        ),
        BIC: getStateValue(
          action.input.BIC,
          state.issuer.paymentRouting.bank?.BIC ?? null,
        ),
        SWIFT: getStateValue(
          action.input.SWIFT,
          state.issuer.paymentRouting.bank?.SWIFT ?? null,
        ),
        accountNum:
          action.input.accountNum ??
          state.issuer.paymentRouting.bank?.accountNum ??
          "",
        accountType: getStateValue(
          action.input.accountType,
          state.issuer.paymentRouting.bank?.accountType ?? null,
        ),
        address: {
          city: getStateValue(
            action.input.city,
            state.issuer.paymentRouting.bank?.address.city ?? null,
          ),
          country: getStateValue(
            action.input.country,
            state.issuer.paymentRouting.bank?.address.country ?? null,
          ),
          extendedAddress: getStateValue(
            action.input.extendedAddress,
            state.issuer.paymentRouting.bank?.address.extendedAddress ?? null,
          ),
          postalCode: getStateValue(
            action.input.postalCode,
            state.issuer.paymentRouting.bank?.address.postalCode ?? null,
          ),
          stateProvince: getStateValue(
            action.input.stateProvince,
            state.issuer.paymentRouting.bank?.address.stateProvince ?? null,
          ),
          streetAddress: getStateValue(
            action.input.streetAddress,
            state.issuer.paymentRouting.bank?.address.streetAddress ?? null,
          ),
        },
        beneficiary: getStateValue(
          action.input.beneficiary,
          state.issuer.paymentRouting.bank?.beneficiary ?? null,
        ),
        name: action.input.name ?? state.issuer.paymentRouting.bank?.name ?? "",
        memo: getStateValue(
          action.input.memo,
          state.issuer.paymentRouting.bank?.memo ?? null,
        ),
        intermediaryBank: {
          ABA: getStateValue(
            action.input.ABAIntermediary,
            state.issuer.paymentRouting.bank?.intermediaryBank?.ABA ?? null,
          ),
          BIC: getStateValue(
            action.input.BICIntermediary,
            state.issuer.paymentRouting.bank?.intermediaryBank?.BIC ?? null,
          ),
          SWIFT: getStateValue(
            action.input.SWIFTIntermediary,
            state.issuer.paymentRouting.bank?.intermediaryBank?.SWIFT ?? null,
          ),
          accountNum:
            action.input.accountNumIntermediary ??
            state.issuer.paymentRouting.bank?.intermediaryBank?.accountNum ??
            "",
          accountType: getStateValue(
            action.input.accountTypeIntermediary,
            state.issuer.paymentRouting.bank?.intermediaryBank?.accountType ??
              null,
          ),
          address: {
            city: getStateValue(
              action.input.cityIntermediary,
              state.issuer.paymentRouting.bank?.intermediaryBank?.address
                .city ?? null,
            ),
            country: getStateValue(
              action.input.countryIntermediary,
              state.issuer.paymentRouting.bank?.intermediaryBank?.address
                .country ?? null,
            ),
            extendedAddress: getStateValue(
              action.input.extendedAddressIntermediary,
              state.issuer.paymentRouting.bank?.intermediaryBank?.address
                .extendedAddress ?? null,
            ),
            postalCode: getStateValue(
              action.input.postalCodeIntermediary,
              state.issuer.paymentRouting.bank?.intermediaryBank?.address
                .postalCode ?? null,
            ),
            stateProvince: getStateValue(
              action.input.stateProvinceIntermediary,
              state.issuer.paymentRouting.bank?.intermediaryBank?.address
                .stateProvince ?? null,
            ),
            streetAddress: getStateValue(
              action.input.streetAddressIntermediary,
              state.issuer.paymentRouting.bank?.intermediaryBank?.address
                .streetAddress ?? null,
            ),
          },
          beneficiary: getStateValue(
            action.input.beneficiaryIntermediary,
            state.issuer.paymentRouting.bank?.intermediaryBank?.beneficiary ??
              null,
          ),
          name:
            action.input.nameIntermediary ??
            state.issuer.paymentRouting.bank?.intermediaryBank?.name ??
            "",
          memo: getStateValue(
            action.input.memoIntermediary,
            state.issuer.paymentRouting.bank?.intermediaryBank?.memo ?? null,
          ),
        },
      };
    } catch (e) {
      console.error(e);
    }
  },
  editIssuerWalletOperation(state, action, dispatch) {
    try {
      if (!state.issuer.paymentRouting) {
        state.issuer.paymentRouting = {
          bank: null,
          wallet: null,
        };
      }

      state.issuer.paymentRouting.wallet = {
        address:
          action.input.address ??
          state.issuer.paymentRouting.wallet?.address ??
          null,
        chainId:
          action.input.chainId ??
          state.issuer.paymentRouting.wallet?.chainId ??
          null,
        chainName:
          action.input.chainName ??
          state.issuer.paymentRouting.wallet?.chainName ??
          null,
        rpc:
          action.input.rpc ?? state.issuer.paymentRouting.wallet?.rpc ?? null,
      };
    } catch (e) {
      console.error(e);
    }
  },
  editPayerOperation(state, action, dispatch) {
    try {
      state.payer = {
        ...state.payer,
        address: {
          city: getStateValue(
            action.input.city,
            state.payer.address?.city ?? null,
          ),
          country: getStateValue(
            action.input.country,
            state.payer.address?.country ?? null,
          ),
          extendedAddress: getStateValue(
            action.input.extendedAddress,
            state.payer.address?.extendedAddress ?? null,
          ),
          postalCode: getStateValue(
            action.input.postalCode,
            state.payer.address?.postalCode ?? null,
          ),
          stateProvince: getStateValue(
            action.input.stateProvince,
            state.payer.address?.stateProvince ?? null,
          ),
          streetAddress: getStateValue(
            action.input.streetAddress,
            state.payer.address?.streetAddress ?? null,
          ),
        },
        contactInfo: {
          tel: getStateValue(
            action.input.tel,
            state.payer.contactInfo?.tel ?? null,
          ),
          email: getStateValue(
            action.input.email,
            state.payer.contactInfo?.email ?? null,
          ),
        },
        country: action.input.country ?? state.payer.country,
        id: action.input.id ? { taxId: action.input.id } : state.payer.id,
        name: getStateValue(action.input.name, state.payer.name ?? null),
      };
    } catch (e) {
      console.error(e);
    }
  },
  editPayerBankOperation(state, action, dispatch) {
    try {
      if (!state.payer.paymentRouting) {
        state.payer.paymentRouting = {
          bank: null,
          wallet: null,
        };
      }

      state.payer.paymentRouting.bank = {
        ABA: getStateValue(
          action.input.ABA,
          state.payer.paymentRouting.bank?.ABA ?? null,
        ),
        BIC: getStateValue(
          action.input.BIC,
          state.payer.paymentRouting.bank?.BIC ?? null,
        ),
        SWIFT: getStateValue(
          action.input.SWIFT,
          state.payer.paymentRouting.bank?.SWIFT ?? null,
        ),
        accountNum:
          action.input.accountNum ??
          state.payer.paymentRouting.bank?.accountNum ??
          "",
        accountType: getStateValue(
          action.input.accountType,
          state.payer.paymentRouting.bank?.accountType ?? null,
        ),
        address: {
          city: getStateValue(
            action.input.city,
            state.payer.paymentRouting.bank?.address.city ?? null,
          ),
          country: getStateValue(
            action.input.country,
            state.payer.paymentRouting.bank?.address.country ?? null,
          ),
          extendedAddress: getStateValue(
            action.input.extendedAddress,
            state.payer.paymentRouting.bank?.address.extendedAddress ?? null,
          ),
          postalCode: getStateValue(
            action.input.postalCode,
            state.payer.paymentRouting.bank?.address.postalCode ?? null,
          ),
          stateProvince: getStateValue(
            action.input.stateProvince,
            state.payer.paymentRouting.bank?.address.stateProvince ?? null,
          ),
          streetAddress: getStateValue(
            action.input.streetAddress,
            state.payer.paymentRouting.bank?.address.streetAddress ?? null,
          ),
        },
        beneficiary: getStateValue(
          action.input.beneficiary,
          state.payer.paymentRouting.bank?.beneficiary ?? null,
        ),
        name: action.input.name ?? state.payer.paymentRouting.bank?.name ?? "",
        memo: getStateValue(
          action.input.memo,
          state.payer.paymentRouting.bank?.memo ?? null,
        ),
        intermediaryBank: {
          ABA: getStateValue(
            action.input.ABAIntermediary,
            state.payer.paymentRouting.bank?.intermediaryBank?.ABA ?? null,
          ),
          BIC: getStateValue(
            action.input.BICIntermediary,
            state.payer.paymentRouting.bank?.intermediaryBank?.BIC ?? null,
          ),
          SWIFT: getStateValue(
            action.input.SWIFTIntermediary,
            state.payer.paymentRouting.bank?.intermediaryBank?.SWIFT ?? null,
          ),
          accountNum:
            action.input.accountNumIntermediary ??
            state.payer.paymentRouting.bank?.intermediaryBank?.accountNum ??
            "",
          accountType: getStateValue(
            action.input.accountTypeIntermediary,
            state.payer.paymentRouting.bank?.intermediaryBank?.accountType ??
              null,
          ),
          address: {
            city: getStateValue(
              action.input.cityIntermediary,
              state.payer.paymentRouting.bank?.intermediaryBank?.address.city ??
                null,
            ),
            country: getStateValue(
              action.input.countryIntermediary,
              state.payer.paymentRouting.bank?.intermediaryBank?.address
                .country ?? null,
            ),
            extendedAddress: getStateValue(
              action.input.extendedAddressIntermediary,
              state.payer.paymentRouting.bank?.intermediaryBank?.address
                .extendedAddress ?? null,
            ),
            postalCode: getStateValue(
              action.input.postalCodeIntermediary,
              state.payer.paymentRouting.bank?.intermediaryBank?.address
                .postalCode ?? null,
            ),
            stateProvince: getStateValue(
              action.input.stateProvinceIntermediary,
              state.payer.paymentRouting.bank?.intermediaryBank?.address
                .stateProvince ?? null,
            ),
            streetAddress: getStateValue(
              action.input.streetAddressIntermediary,
              state.payer.paymentRouting.bank?.intermediaryBank?.address
                .streetAddress ?? null,
            ),
          },
          beneficiary: getStateValue(
            action.input.beneficiaryIntermediary,
            state.payer.paymentRouting.bank?.intermediaryBank?.beneficiary ??
              null,
          ),
          name:
            action.input.nameIntermediary ??
            state.payer.paymentRouting.bank?.intermediaryBank?.name ??
            "",
          memo: getStateValue(
            action.input.memoIntermediary,
            state.payer.paymentRouting.bank?.intermediaryBank?.memo ?? null,
          ),
        },
      };
    } catch (e) {
      console.error(e);
    }
  },
  editPayerWalletOperation(state, action, dispatch) {
    try {
      if (!state.payer.paymentRouting) {
        state.payer.paymentRouting = {
          bank: null,
          wallet: null,
        };
      }

      state.payer.paymentRouting.wallet = {
        address:
          action.input.address ??
          state.payer.paymentRouting.wallet?.address ??
          null,
        chainId:
          action.input.chainId ??
          state.payer.paymentRouting.wallet?.chainId ??
          null,
        chainName:
          action.input.chainName ??
          state.payer.paymentRouting.wallet?.chainName ??
          null,
        rpc: action.input.rpc ?? state.payer.paymentRouting.wallet?.rpc ?? null,
      };
    } catch (e) {
      console.error(e);
    }
  },
};

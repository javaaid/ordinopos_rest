import React from 'react';
import { createPortal } from 'react-dom';
import { useModalContext } from './contexts/AppContext';

// Import all modal components
import ModifierModal from './components/ModifierModal';
import PizzaBuilder from './components/PizzaBuilder';
import BurgerBuilder from './components/BurgerBuilder';
import PaymentModal from './components/PaymentModal';
import ReceiptModal from './components/ReceiptModal';
import ReservationModal from './components/ReservationModal';
import CustomerSelectModal from './components/CustomerSelectModal';
import CustomerEditModal from './components/CustomerEditModal';
import WaitlistModal from './components/WaitlistModal';
import ProductContextMenu from './components/ProductContextMenu';
import CategoryEditModal from './components/CategoryEditModal';
import LocationEditModal from './components/LocationEditModal';
import PrinterEditModal from './components/PrinterEditModal';
import TaxRateEditModal from './components/TaxRateEditModal';
import UserEditModal from './components/UserEditModal';
import RoleEditModal from './components/RoleEditModal';
import IngredientEditModal from './components/IngredientEditModal';
import SupplierEditModal from './components/SupplierEditModal';
import PaymentTypeEditModal from './components/PaymentTypeEditModal';
import TableEditModal from './components/TableEditModal';
import QRCodeModal from './components/QRCodeModal';
import QRCodePluginInfoModal from './components/QRCodePluginInfoModal';
import PurchaseOrderModal from './components/PurchaseOrderModal';
import ActivationModal from './components/ActivationModal';
import LogWasteModal from './components/LogWasteModal';
import SubscriptionModal from './components/SubscriptionModal';
import ClientInvoiceModal from './components/ClientInvoiceModal';
import StockCountModal from './components/StockCountModal';
import PromotionModal from './components/PromotionModal';
import PromotionEditModal from './components/PromotionEditModal';
import TextInputModal from './components/TextInputModal';
import HeldOrdersModal from './components/HeldOrdersModal';
import ModifierGroupEditModal from './components/ModifierGroupEditModal';
import DiscountEditModal from './components/DiscountEditModal';
import SurchargeEditModal from './components/SurchargeEditModal';
import VoidOrderModal from './components/VoidOrderModal';
import ProductEditModal from './components/ProductEditModal';
import DiscountModal from './components/DiscountModal';
import PaymentTerminalSettingsModal from './components/PaymentTerminalSettingsModal';
import PizzaOptionEditModal from './components/PizzaOptionEditModal';
import LivePaymentModal from './components/LivePaymentModal';
import GenericDeviceEditModal from './components/GenericDeviceEditModal';
import KitchenDisplayEditModal from './components/KitchenDisplayEditModal';
import CustomerDisplayEditModal from './components/CustomerDisplayEditModal';
import ChooseStaffModal from './components/ChooseStaffModal';
import CallerIDModal from './components/CallerIDModal';
import AIChatModal from './components/AIChatModal';
import ProductBulkEditModal from './components/ProductBulkEditModal';
import A4Invoice from './components/A4Invoice';
import SignageContentEditModal from './components/SignageContentEditModal';
import SignagePlaylistEditModal from './components/SignagePlaylistEditModal';
import SignageScheduleEditModal from './components/SignageScheduleEditModal';
import SignageDisplayEditModal from './components/SignageDisplayEditModal';
import PrintServerGuideModal from './components/PrintServerGuideModal';
import NumberInputModal from './components/NumberInputModal';
import ConfirmModal from './components/ConfirmModal';
import DashboardCustomizeModal from './components/DashboardCustomizeModal';
import LoyaltyRedemptionModal from './components/LoyaltyRedemptionModal';
import BarcodeScannerModal from './components/BarcodeScannerModal';
import BurgerOptionEditModal from './components/BurgerOptionEditModal';
import ItemDiscountModal from './components/ItemDiscountModal';

const ModalManager: React.FC = () => {
    const { modal, closeModal } = useModalContext();
    const { type, props } = modal;
    const modalRoot = document.getElementById('modal-root');

    // A simple mapping of modal types to their components
    const MODAL_COMPONENTS: { [key: string]: React.FC<any> } = {
        modifier: ModifierModal,
        pizzaBuilder: PizzaBuilder,
        burgerBuilder: BurgerBuilder,
        payment: PaymentModal,
        receipt: ReceiptModal,
        reservation: ReservationModal,
        customerSelect: CustomerSelectModal,
        customerEdit: CustomerEditModal,
        waitlist: WaitlistModal,
        productContextMenu: ProductContextMenu,
        categoryEdit: CategoryEditModal,
        locationEdit: LocationEditModal,
        printerEdit: PrinterEditModal,
        taxRateEdit: TaxRateEditModal,
        userEdit: UserEditModal,
        roleEdit: RoleEditModal,
        ingredientEdit: IngredientEditModal,
        supplierEdit: SupplierEditModal,
        paymentTypeEdit: PaymentTypeEditModal,
        tableEdit: TableEditModal,
        qrCode: QRCodeModal,
        qrInfo: QRCodePluginInfoModal,
        purchaseOrder: PurchaseOrderModal,
        activation: ActivationModal,
        logWaste: LogWasteModal,
        subscription: SubscriptionModal,
        clientInvoice: ClientInvoiceModal,
        stockCount: StockCountModal,
        promotion: PromotionModal,
        promotionEdit: PromotionEditModal,
        textInput: TextInputModal,
        heldOrders: HeldOrdersModal,
        modifierGroupEdit: ModifierGroupEditModal,
        discountEdit: DiscountEditModal,
        surchargeEdit: SurchargeEditModal,
        voidOrder: VoidOrderModal,
        productEdit: ProductEditModal,
        productBulkEdit: ProductBulkEditModal,
        A4Invoice: A4Invoice, // Retained for modal-like preview if needed, but not for printing.
        discount: DiscountModal,
        itemDiscount: ItemDiscountModal,
        paymentTerminalSettings: PaymentTerminalSettingsModal,
        pizzaOptionEdit: PizzaOptionEditModal,
        livePayment: LivePaymentModal,
        genericDeviceEdit: GenericDeviceEditModal,
        kitchenDisplayEdit: KitchenDisplayEditModal,
        customerDisplayEdit: CustomerDisplayEditModal,
        chooseStaff: ChooseStaffModal,
        callerID: CallerIDModal,
        aiChat: AIChatModal,
        signageContentEdit: SignageContentEditModal,
        signagePlaylistEdit: SignagePlaylistEditModal,
        signageScheduleEdit: SignageScheduleEditModal,
        signageDisplayEdit: SignageDisplayEditModal,
        printServerGuide: PrintServerGuideModal,
        numberInput: NumberInputModal,
        confirm: ConfirmModal,
        dashboardCustomize: DashboardCustomizeModal,
        loyaltyRedemption: LoyaltyRedemptionModal,
        barcodeScanner: BarcodeScannerModal,
        burgerOptionEdit: BurgerOptionEditModal,
    };

    const SpecificModal = type ? MODAL_COMPONENTS[type] : null;

    if (!SpecificModal || !modalRoot) {
        return null;
    }

    return createPortal(
        <SpecificModal isOpen={!!type} onClose={closeModal} {...props} />,
        modalRoot
    );
};

export default ModalManager;
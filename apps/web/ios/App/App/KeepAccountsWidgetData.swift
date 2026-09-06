import Foundation

enum KeepAccountsWidgetData {
    static let totalBalanceKey = "keep_accounts_widget_total_balance"
    static let monthlyIncomeKey = "keep_accounts_widget_monthly_income"
    static let monthlyExpenseKey = "keep_accounts_widget_monthly_expense"
    static let updatedAtKey = "keep_accounts_widget_updated_at"

    static func defaults() -> UserDefaults? {
        guard let appGroup = Bundle.main.object(forInfoDictionaryKey: "KeepAccountsAppGroup") as? String,
              !appGroup.isEmpty else {
            return nil
        }
        return UserDefaults(suiteName: appGroup)
    }
}

struct KeepAccountsWidgetSummary {
    let totalBalance: Double
    let monthlyIncome: Double
    let monthlyExpense: Double
    let updatedAt: String

    init?(defaults: UserDefaults) {
        guard defaults.object(forKey: KeepAccountsWidgetData.totalBalanceKey) != nil else {
            return nil
        }
        totalBalance = defaults.double(forKey: KeepAccountsWidgetData.totalBalanceKey)
        monthlyIncome = defaults.double(forKey: KeepAccountsWidgetData.monthlyIncomeKey)
        monthlyExpense = defaults.double(forKey: KeepAccountsWidgetData.monthlyExpenseKey)
        updatedAt = defaults.string(forKey: KeepAccountsWidgetData.updatedAtKey) ?? ""
    }
}
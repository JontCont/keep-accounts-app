import Capacitor
import WidgetKit

@objc(KeepAccountsWidgetPlugin)
public class KeepAccountsWidgetPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "KeepAccountsWidgetPlugin"
    public let jsName = "KeepAccountsWidget"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "updateSummary", returnType: CAPPluginReturnPromise)
    ]

    @objc func updateSummary(_ call: CAPPluginCall) {
        guard let totalBalance = call.getDouble("totalBalance"),
              let monthlyIncome = call.getDouble("monthlyIncome"),
              let monthlyExpense = call.getDouble("monthlyExpense"),
              let defaults = KeepAccountsWidgetData.defaults() else {
            call.reject("Unable to update the Keep Accounts Widget summary")
            return
        }

        defaults.set(totalBalance, forKey: KeepAccountsWidgetData.totalBalanceKey)
        defaults.set(monthlyIncome, forKey: KeepAccountsWidgetData.monthlyIncomeKey)
        defaults.set(monthlyExpense, forKey: KeepAccountsWidgetData.monthlyExpenseKey)
        defaults.set(
            call.getString("updatedAt") ?? ISO8601DateFormatter().string(from: Date()),
            forKey: KeepAccountsWidgetData.updatedAtKey
        )

        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadTimelines(ofKind: "KeepAccountsWidget")
        }
        call.resolve()
    }
}
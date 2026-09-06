import SwiftUI
import WidgetKit

private struct KeepAccountsWidgetEntry: TimelineEntry {
    let date: Date
    let summary: KeepAccountsWidgetSummary?
}

private struct KeepAccountsWidgetProvider: TimelineProvider {
    func placeholder(in context: Context) -> KeepAccountsWidgetEntry {
        KeepAccountsWidgetEntry(date: Date(), summary: nil)
    }

    func getSnapshot(in context: Context, completion: @escaping (KeepAccountsWidgetEntry) -> Void) {
        completion(currentEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<KeepAccountsWidgetEntry>) -> Void) {
        let entry = currentEntry()
        let refreshDate = Calendar.current.date(byAdding: .minute, value: 30, to: Date())
            ?? Date().addingTimeInterval(1800)
        completion(Timeline(entries: [entry], policy: .after(refreshDate)))
    }

    private func currentEntry() -> KeepAccountsWidgetEntry {
        let summary = KeepAccountsWidgetData.defaults().flatMap {
            KeepAccountsWidgetSummary(defaults: $0)
        }
        return KeepAccountsWidgetEntry(date: Date(), summary: summary)
    }
}

private struct KeepAccountsWidgetView: View {
    let entry: KeepAccountsWidgetEntry

    @Environment(\.widgetFamily) private var widgetFamily

    var body: some View {
        Group {
            if let summary = entry.summary {
                VStack(alignment: .leading, spacing: 8) {
                    Text("目前總餘額")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(currency(summary.totalBalance))
                        .font(.system(size: 25, weight: .bold, design: .rounded))
                        .minimumScaleFactor(0.7)
                        .lineLimit(1)
                    if widgetFamily == .systemMedium {
                        HStack(spacing: 16) {
                            metric(title: "本月收入", amount: summary.monthlyIncome)
                            metric(title: "本月支出", amount: summary.monthlyExpense)
                        }
                    }
                }
            } else {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Keep Accounts")
                        .font(.headline)
                    Text("開啟 app 後即可顯示帳務摘要")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding()
    }

    private func metric(title: String, amount: Double) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(title)
                .font(.caption2)
                .foregroundColor(.secondary)
            Text(currency(amount))
                .font(.system(size: 14, weight: .semibold, design: .rounded))
                .minimumScaleFactor(0.7)
                .lineLimit(1)
        }
    }

    private func currency(_ amount: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = Locale(identifier: "zh_TW")
        formatter.currencyCode = "TWD"
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: amount)) ?? "NT$0"
    }
}

@main
struct KeepAccountsWidget: Widget {
    let kind = "KeepAccountsWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: KeepAccountsWidgetProvider()) { entry in
            KeepAccountsWidgetView(entry: entry)
        }
        .configurationDisplayName("帳務總覽")
        .description("查看目前餘額與本月收支。")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
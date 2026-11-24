import 'package:flutter_test/flutter_test.dart';
import 'package:family_tracker/main.dart';

void main() {
  testWidgets('Family Tracker App basic smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const FamilyTrackerApp());
    expect(find.text('Family Tracker'), findsOneWidget);
    await tester.pump(const Duration(milliseconds: 1300));
    await tester.pump();
  });
}

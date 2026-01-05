<?php
// CONFIG: Change this to your live CSV URL
$csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTRO_hGp37GGxrJ39u0Gux2G0DTCnItZnu6BKMNmoYJvZ9rdVBoMgERGt4DXosYP6PcYs5SU7zpFllX/pub?gid=0&single=true&output=csv';

// Fetch remote CSV into a temporary stream
$temp = tmpfile();
$csvContent = @file_get_contents($csvUrl);
if ($csvContent === false) {
    echo 'can\'t read file';
    exit;
}
fwrite($temp, $csvContent);
rewind($temp);

// Parse CSV
$headers = fgetcsv($temp);
if (!$headers) {
    fclose($temp);
    echo 'can\'t read file';
    exit;
}
$headers = array_map('trim', $headers);

$data = [];

while (($row = fgetcsv($temp)) !== false) {
    if (empty(array_filter($row))) continue; // skip empty rows
    $row = array_pad($row, count($headers), '');
    $entry = @array_combine($headers, $row);
    if (!$entry || !is_array($entry)) continue;

    $entry = array_map('trim', $entry);

    $day = $entry['Day'] ?? '';
    $venueDate = $entry['Venue Date'] ?? '';
    $venueTime = $entry['Venue Hour'] ?? '';
    $venueDuration = $entry['Venue Duration'] ?? '';
    $venueLocation = $entry['Venue Location'] ?? '';
    $venueTitle = $entry['Venue Title'] ?? '';
    $venueRoom = $entry['Venue Room'] ?? '';
    $venueModerator = $entry['Venue Moderation'] ?? '';
    $venueId = $entry['ID'] ?? '';

    $sessionId = $entry['ID'] ?? '';
    $highlight = isset($entry['Highlight']) ? (int)$entry['Highlight'] : 0;
    $sessionType = $entry['Session Type'] ?? '';
    $sessionDurationPct = $entry['Session Duration'] ?? '';
    $sessionThumbnail = $entry['Session Thumbnail'] ?? '';
    $sessionTitle = $entry['Session Title'] ?? '';
    $sessionAuthor = $entry['Session Author(s)'] ?? '';

    $affiliations = $entry['Affiliations'] ?? '';
    $abstract = $entry['Abstract'] ?? '';
    $references = $entry['References'] ?? '';
    $keywords = $entry['Keywords'] ?? '';
    $biographies = $entry['Biographies'] ?? '';

    if (!$day || !$venueTime || !$venueLocation || !$venueId) continue;

    $venueKey = $venueTime . '|' . $venueTitle . '|' . $venueLocation;

    if (!isset($data[$day])) {
        $data[$day] = [];
    }

    if (!isset($data[$day][$venueKey])) {
        $venue = [
            'id' => $venueId,
            'venue_date' => $venueDate,
            'time' => $venueTime,
            'location' => $venueLocation,
            'title' => $venueTitle,
            'room' => $venueRoom,
            'moderator' => $venueModerator,
            'duration' => $venueDuration,
            'sessions' => []
        ];
        $data[$day][$venueKey] = array_filter($venue, fn($v) => $v !== '');
    }

    $session = [
        'id' => $sessionId,
        'highlight' => $highlight,
        'type' => $sessionType,
        'author' => $sessionAuthor,
        'title' => $sessionTitle,
        'thumbnail' => $sessionThumbnail,
        'duration_pct' => $sessionDurationPct,
        'affiliations' => $affiliations,
        'abstract' => $abstract,
        'references' => $references,
        'keywords' => $keywords,
        'biographies' => $biographies
    ];

    $data[$day][$venueKey]['sessions'][] = array_filter($session, fn($v) => $v !== '');
}

fclose($temp);

// Format output
$output = [];
foreach ($data as $day => $venues) {
    $output[] = [
        'day' => $day,
        'venues' => array_values($venues)
    ];
}

// Save as JSON
file_put_contents(__DIR__ . '/program.json', json_encode($output, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo 'program updated';

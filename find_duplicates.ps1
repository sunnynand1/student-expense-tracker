# Get all files recursively
$files = Get-ChildItem -Path . -Recurse -File

# Create a hashtable to store file hashes
$fileHashes = @{}

# Create an array to store duplicate files
$duplicates = @()

# Calculate hashes for all files
foreach ($file in $files) {
    try {
        $hash = (Get-FileHash -Path $file.FullName -Algorithm SHA256).Hash
        
        if ($fileHashes.ContainsKey($hash)) {
            $fileHashes[$hash] += $file.FullName
        } else {
            $fileHashes[$hash] = @($file.FullName)
        }
    } catch {
        Write-Warning "Could not process file: $($file.FullName)"
    }
}

# Find all hashes with more than one file
$duplicateGroups = $fileHashes.GetEnumerator() | Where-Object { $_.Value.Count -gt 1 }

# Output the results
if ($duplicateGroups.Count -gt 0) {
    Write-Host "Found $($duplicateGroups.Count) groups of duplicate files:" -ForegroundColor Yellow
    $groupNumber = 1
    
    foreach ($group in $duplicateGroups) {
        Write-Host "`nGroup $groupNumber (Hash: $($group.Key))" -ForegroundColor Green
        $group.Value | ForEach-Object {
            Write-Host "- $_"
        }
        $groupNumber++
    }
} else {
    Write-Host "No duplicate files found." -ForegroundColor Green
}

# Save results to a text file
$outputFile = "duplicate_files_report.txt"
$duplicateGroups | ForEach-Object {
    "Group (Hash: $($_.Key))" | Out-File -FilePath $outputFile -Append
    $_.Value | ForEach-Object {
        "- $_" | Out-File -FilePath $outputFile -Append
    }
    "" | Out-File -FilePath $outputFile -Append
}

Write-Host "`nReport saved to $outputFile" -ForegroundColor Cyan

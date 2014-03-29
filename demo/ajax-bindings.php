<?php

session_start();

// sleep(1);

if (isset($_GET['remove'])) {
	$email = $_GET['remove'];
	unset($_SESSION['email'][$email]);
	echo json_encode(array(
		'result' => 'ok',
		'trigger' => 'item.deleted',
		'email' => $email,
	));
	exit;
}

if ('3' == $_GET['r'] && isset($_POST['email'])) {
	if (!preg_match('#^\s*[a-z0-9_-]+@[a-z0-9_-]+[.][a-z]+\s*$#i', $_POST['email'])) {
		$error = '<p class="help-block">Sorry, but I expected something like <i>example@gmail.com</i></p>';
	} else {
		$email = trim($_POST['email']);
		$_SESSION['email'][$email] = $email;
		echo json_encode(array(
			'result' => 'ok',
			'trigger' => 'item.added',
			'email' => $email,
		));
		exit;
	}
} else {
	$error = '';
}

if ('8' == $_GET['r']) {
	echo json_encode(array(
		'result' => 'ok',
		'trigger' => 'submitted',
		'message' => sprintf('Server time is %s', date('H:i:s')),
	));
	exit;
}

echo '<html>';
echo '<body>';
echo '<div class="garbage">Some unused data...</div>';

if ('1' == $_GET['r']) {
	echo '<div data-marker="ajax-body"><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p></div>';
}

elseif ('2' == $_GET['r']) {
	echo '<h1 data-marker="ajax-title">AJAX title</h1>';
	echo '<div data-marker="ajax-body"><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p></div>';
}

elseif ('3' == $_GET['r']) {
	echo '<h1 data-marker="ajax-title">Add email</h1>';
	echo '<div data-marker="ajax-body"><form action="ajax-bindings.php?r=3" method="post" class="form-horizontal" data-raise="ajax-request">' 
	. '<div class="form-group">'
	. '<label class="col-sm-4 control-label" for="email">Email <span class="required">*</span></label>'
	. '<div class="col-sm-7"><input class="form-control" name="email" type="text" />' . $error . '</div>'
	. '</div>'
	. '<div class="form-group"><div class="col-sm-offset-4 col-sm-10"><input type="submit" name="submit" class="btn btn-primary" value="Submit"></div></div>'
	. '</form></div>';
}

elseif ('4' == $_GET['r']) {
	echo '<table class="table table-condenced table-bordered" id="t1" data-blockui="cover" data-update-after="item.added item.deleted" data-url="ajax-bindings.php?r=4">'
	. '<tr><th>Email</th><th style="width:80px;"></th></tr>';
	if (!empty($_SESSION['email'])) {
		foreach ($_SESSION['email'] as $email) {
			echo '<tr><td>' . htmlspecialchars($email) . '</td><td style="width:80px;text-align:center;"><a href="ajax-bindings.php?remove=' . urlencode($email) . '" class="btn btn-danger" data-raise="ajax-request" data-confirmation="Are you sure?"><span class="glyphicon glyphicon-trash"></a></td></tr>';
		}
	} else {
		echo '<tr><td colspan="2">No data found...</td></tr>';
	}
	echo '</table>';
}

elseif ('5' == $_GET['r']) {
	echo '<button class="btn btn-default" data-url="ajax-bindings.php?r=6" data-raise="ajax-request" data-source="button"><span class="glyphicon glyphicon-eye-close"></span> Unwatch</button>';
}

elseif ('6' == $_GET['r']) {
	echo '<button class="btn btn-default" data-url="ajax-bindings.php?r=5" data-raise="ajax-request" data-source="button"><span class="glyphicon glyphicon-eye-open"></span> Watch</button>';
}

elseif ('7' == $_GET['r']) {
	echo '<span data-marker="ajax-body">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</span>';
}

echo '</body>';
echo '</html>';
